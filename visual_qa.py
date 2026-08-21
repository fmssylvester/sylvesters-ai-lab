#!/usr/bin/env python3
"""
visual_qa.py — Dual-vision QA for Remotion renders.

Sends the same rendered visual evidence (image, or frames extracted from a video)
to two independent vision models via OpenRouter:
    - GEMMA    (design / composition critic)
    - NEMOTRON (motion-sequence / visual-consistency critic)
then builds a concise consensus report for the primary coding agent.

Usage:
    python3 visual_qa.py path/to/render.mp4
    python3 visual_qa.py path/to/image.png
    python3 visual_qa.py path/to/render.mp4 --compare iteration_001 iteration_002
    python3 visual_qa.py --report path/to/render.mp4   # machine-readable consensus JSON on stdout

Config (environment / .env):
    OPENROUTER_API_KEY       (required)
    VISION_MODEL_GEMMA       default: google/gemma-4-26b-a4b-it:free
    VISION_MODEL_NEMOTRON    default: nvidia/nemotron-nano-12b-v2-vl:free
    ENABLE_GEMMA             default: true
    ENABLE_NEMOTRON          default: true
    VISUAL_QA_FRAME_COUNT    default: 8
    VISUAL_QA_MAX_WIDTH      default: 1280   (frames resized, aspect kept)
    VISUAL_QA_MIN_SCORE      default: 85
    MAX_VISUAL_ITERATIONS    default: 5      (advisory, used by --compare bookkeeping)

Outputs (project-relative):
    .visual_qa/cache/<hash>.json
    .visual_qa/iterations/iteration_XXX/render.mp4 frames/ gemma.json nemotron.json consensus.json
"""

import argparse
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------- paths

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR
QA_DIR = SCRIPT_DIR / ".visual_qa"
CACHE_DIR = QA_DIR / "cache"
ITER_DIR = QA_DIR / "iterations"
WORK_DIR = Path(os.environ.get("VISUAL_QA_WORK_DIR", "/tmp/visual_qa"))

# ---------------------------------------------------------------- env / .env

def load_dotenv(path):
    """Minimal .env loader (no external deps). Never prints values."""
    try:
        for line in Path(path).read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v
    except OSError:
        pass


load_dotenv(PROJECT_DIR / ".env")

# ---------------------------------------------------------------- settings

def _bool_env(name, default):
    v = os.environ.get(name)
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "on")


def _int_env(name, default):
    try:
        return int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default


API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL_GEMMA = os.environ.get("VISION_MODEL_GEMMA", "google/gemma-4-26b-a4b-it:free")
MODEL_NEMOTRON = os.environ.get("VISION_MODEL_NEMOTRON", "nvidia/nemotron-nano-12b-v2-vl:free")
ENABLE_GEMMA = _bool_env("ENABLE_GEMMA", True)
ENABLE_NEMOTRON = _bool_env("ENABLE_NEMOTRON", True)
FRAME_COUNT = _int_env("VISUAL_QA_FRAME_COUNT", 8)
MAX_WIDTH = _int_env("VISUAL_QA_MAX_WIDTH", 1280)
MIN_SCORE = _int_env("VISUAL_QA_MIN_SCORE", 85)
MAX_ITERATIONS = _int_env("MAX_VISUAL_ITERATIONS", 5)
HTTP_TIMEOUT = _int_env("VISUAL_QA_TIMEOUT", 120)
HTTP_RETRIES = _int_env("VISUAL_QA_RETRIES", 3)
# Gemma is the stronger vision/design reviewer; give its verdicts more weight
# than Nemotron's so its findings are not averaged down by a lenient critic.
WEIGHT_GEMMA = float(os.environ.get("REVIEWER_WEIGHT_GEMMA", "1.0"))
WEIGHT_NEMOTRON = float(os.environ.get("REVIEWER_WEIGHT_NEMOTRON", "0.6"))
# Project design direction injected into both reviewers so they judge against
# OUR design requirements, not just generic visual quality.
DESIGN_DIRECTION_FILE = Path(os.environ.get(
    "VISUAL_QA_DESIGN_DIRECTION", str(PROJECT_DIR / "visual-direction.md")))

def load_design_direction() -> str:
    try:
        return Path(DESIGN_DIRECTION_FILE).read_text()
    except OSError:
        log(f"design direction file not found: {DESIGN_DIRECTION_FILE} (proceeding without it)")
        return ""

DESIGN_DIRECTION = load_design_direction()

# ---------------------------------------------------------------- prompts

SYSTEM_GEMMA = """You are GEMMA, a design and composition critic for motion-graphics video.
You inspect RENDERED FRAMES ONLY — you never write code and never redesign the project.
You judge against BOTH general design quality AND the project's design direction below.

PROJECT DESIGN DIRECTION:
{DESIGN_DIRECTION}

Check compliance with the design direction as a first-class concern: palette adherence
(colors that are NOT allowed / missing required treatment), typography rules (sizes,
weights, hero-text rules, letter-spacing), composition principles (one focal point,
breathing room / minimum 60px padding, depth layers, color temperature), distinctive
elements (glassmorphic cards, physical feel), and anti-patterns (pure black background,
>3 colors per scene, text <60px hero, linear animations, radial-gradient-only background).

Also analyze: composition, hierarchy, scale, spacing, alignment, typography, text
readability, character placement, object proportions, balance, visual density, empty
space, color relationships, contrast, polish, whether elements look too small/large,
competing elements, and overall professionalism.

Respond with ONLY a valid JSON object, no markdown fences, no commentary:
{{
  "overall_score": 0-100,
  "design_compliance": 0-100,
  "confidence": 0-1,
  "issues": [
    {{
      "severity": "critical|high|medium|low",
      "category": "composition|scale|typography|spacing|alignment|color|animation|transition|consistency|design_direction|other",
      "frame": 0,
      "description": "specific observation",
      "recommended_direction": "what to change, not how to code it"
    }}
  ],
  "strengths": ["..."],
  "ready_for_final": false
}}
Use frame index 0 for a single image. Base scores on ALL provided frames."""

SYSTEM_NEMOTRON = """You are NEMOTRON, a visual and motion-sequence critic for motion-graphics video.
You inspect RENDERED FRAMES ONLY — you never write code.
You judge against BOTH general motion quality AND the project's design direction below.

PROJECT DESIGN DIRECTION:
{DESIGN_DIRECTION}

Pay special attention to the MOTION PRINCIPLES and TRANSITION LANGUAGE sections:
physical momentum (source direction, acceleration, settle point/overshoot), depth
through blur, parallax, micro-interactions, transition types (cross-dissolve with
parallax 15-20 frames, hard cuts for rhythm), element entry/exit timing, and whether
the sequence obeys the intended scene structure layer order.

Also analyze: visual consistency between frames, scene progression, object
appearance/disappearance, transitions, animation states, composition changes,
movement, timing-related visual issues, visual continuity, sudden changes, elements
entering/leaving unexpectedly, sequence coherence, and whether the final frame looks
intentional.

Respond with ONLY a valid JSON object, no markdown fences, no commentary:
{{
  "overall_score": 0-100,
  "design_compliance": 0-100,
  "confidence": 0-1,
  "issues": [
    {{
      "severity": "critical|high|medium|low",
      "category": "composition|scale|typography|spacing|alignment|color|animation|transition|consistency|design_direction|other",
      "frame": 0,
      "description": "specific observation",
      "recommended_direction": "what to change, not how to code it"
    }}
  ],
  "strengths": ["..."],
  "ready_for_final": false
}}
The frames are ordered in time. Use the frame index to reference where an issue occurs."""

USER_PROMPT = (
    "These are representative frames from a rendered motion-graphics video"
    " (or a single image). Perform your role as instructed and return the JSON only."
)

# ---------------------------------------------------------------- utilities

def log(msg):
    print(f"[visual_qa] {msg}", file=sys.stderr)


def hash_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()[:24]


def hash_frames(frames) -> str:
    h = hashlib.sha256()
    for fp in sorted(frames):
        h.update(Path(fp).name.encode())
        h.update(open(fp, "rb").read())
    return h.hexdigest()[:24]


def is_video(path: Path) -> bool:
    return path.suffix.lower() in {".mp4", ".mov", ".webm", ".mkv", ".m4v", ".avi"}


def is_image(path: Path) -> bool:
    return path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}


def run(cmd, timeout=300):
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0:
        raise RuntimeError(f"cmd failed ({proc.returncode}): {' '.join(cmd)}\n{proc.stderr[-800:]}")
    return proc.stdout


def check_ffmpeg():
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is not installed (needed for video frame extraction)")


# ---------------------------------------------------------------- frame extraction

def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, timeout=60,
    ).stdout.strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def extract_frames(video: Path, frames_dir: Path, count: int, max_width: int):
    """Evenly distributed frames across the video (first, early, mid, transitions, late, final)."""
    check_ffmpeg()
    frames_dir.mkdir(parents=True, exist_ok=True)
    duration = probe_duration(video)
    if duration <= 0:
        raise RuntimeError("could not read video duration (corrupted or unsupported file)")
    if count < 2:
        count = 2

    times = []
    if count == 1:
        times = [duration / 2]
    else:
        for i in range(count):
            if count <= 2:
                frac = i / (count - 1)
            else:
                frac = i / (count - 1)
            t = min(frac * duration, max(0.0, duration - 0.5))
            times.append(round(t, 3))

    frames = []
    for i, t in enumerate(times, 1):
        fp = frames_dir / f"frame_{i:03d}.jpg"
        run([
            "ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(video),
            "-frames:v", "1", "-vf", f"scale='min({max_width},iw)':-2",
            "-q:v", "3", str(fp),
        ])
        frames.append(fp)
    return frames


def prepare_single_image(image: Path, work_dir: Path, max_width: int):
    check_ffmpeg()
    work_dir.mkdir(parents=True, exist_ok=True)
    fp = work_dir / "frame_001.jpg"
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(image),
        "-vf", f"scale='min({max_width},iw)':-2", "-q:v", "3", str(fp),
    ])
    return [fp]


# ---------------------------------------------------------------- API call

def _call_openrouter(model, image_paths, system_prompt, user_prompt):
    parts = [{"type": "text", "text": user_prompt}]
    for img in image_paths:
        data = Path(img).read_bytes()
        parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{base64.b64encode(data).decode()}"},
        })

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": parts},
        ],
        "temperature": 0.2,
        "max_tokens": 2048,
    }
    body = json.dumps(payload).encode()

    last_err = None
    for attempt in range(1, HTTP_RETRIES + 1):
        req = urllib.request.Request(
            API_URL, data=body,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/HeyPuter/puter",
                "X-Title": "visual_qa",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
                data = json.loads(resp.read())
            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError, TypeError):
                last_err = f"unusable response body: {str(data)[:300]}"
                # some free endpoints choke on structured output params; retry without them
                if "response_format" in payload:
                    log(f"{model}: response had no choices, retrying without json_mode")
                    payload.pop("response_format")
                    body = json.dumps(payload).encode()
                    continue
                raise RuntimeError(last_err)
        except urllib.error.HTTPError as e:
            detail = e.read()[:400].decode(errors="replace")
            status = e.code
            last_err = f"HTTP {status}: {detail}"
            if status in (400, 401, 403):
                break  # not retryable
            if status == 429:
                wait = min(2 ** attempt * 5, 60)
                log(f"{model} rate-limited, retry {attempt}/{HTTP_RETRIES} in {wait}s")
                time.sleep(wait)
                continue
            time.sleep(2 * attempt)
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last_err = f"network: {e}"
            time.sleep(2 * attempt)
    raise RuntimeError(f"OpenRouter call failed ({model}): {last_err}")


# ---------------------------------------------------------------- JSON recovery

def extract_json(text):
    """Robust extraction of the first JSON object from a model reply."""
    if not text:
        return None
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start : i + 1])
                except json.JSONDecodeError:
                    return None
    return None


def validate_report(obj):
    """Normalize a model response into the canonical schema; None if unusable."""
    if not isinstance(obj, dict):
        return None
    score = obj.get("overall_score")
    try:
        score = max(0, min(100, int(score)))
    except (TypeError, ValueError):
        score = 0
    try:
        confidence = max(0.0, min(1.0, float(obj.get("confidence", 0))))
    except (TypeError, ValueError):
        confidence = 0.0

    issues = []
    raw_issues = obj.get("issues")
    if isinstance(raw_issues, list):
        for it in raw_issues:
            if not isinstance(it, dict):
                continue
            sev = str(it.get("severity", "low")).lower()
            if sev not in ("critical", "high", "medium", "low"):
                sev = "low"
            cat = str(it.get("category", "other")).lower()
            allowed = ("composition", "scale", "typography", "spacing", "alignment",
                       "color", "animation", "transition", "consistency",
                       "design_direction", "other")
            if cat not in allowed:
                cat = "other"
            try:
                frame = int(it.get("frame", 0))
            except (TypeError, ValueError):
                frame = 0
            desc = str(it.get("description", "")).strip()
            if not desc:
                continue
            issues.append({
                "severity": sev,
                "category": cat,
                "frame": frame,
                "description": desc,
                "recommended_direction": str(it.get("recommended_direction", "")).strip(),
            })

    strengths = [str(s).strip() for s in (obj.get("strengths") or []) if str(s).strip()]
    try:
        compliance = max(0, min(100, int(obj.get("design_compliance", 0))))
    except (TypeError, ValueError):
        compliance = 0
    return {
        "overall_score": score,
        "design_compliance": compliance,
        "confidence": confidence,
        "issues": issues,
        "strengths": strengths,
        "ready_for_final": bool(obj.get("ready_for_final", False)),
    }


def run_reviewer(name, model, image_paths, system_prompt):
    if not API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set (check .env or environment)")
    log(f"reviewer {name}: sending {len(image_paths)} frame(s) to {model}")
    raw = _call_openrouter(model, image_paths, system_prompt, USER_PROMPT)
    obj = extract_json(raw)
    if obj is None:
        log(f"reviewer {name}: malformed JSON, falling back to free-text extraction")
        return {"raw_text": raw[:2000], "parse_error": True, "overall_score": 0,
                "design_compliance": 0, "confidence": 0, "issues": [],
                "strengths": [], "ready_for_final": False}
    report = validate_report(obj)
    if report is None:
        return {"raw_text": raw[:2000], "parse_error": True, "overall_score": 0,
                "design_compliance": 0, "confidence": 0, "issues": [],
                "strengths": [], "ready_for_final": False}
    report["model"] = model
    report["raw_text"] = raw[:4000]
    return report


# ---------------------------------------------------------------- consensus

def norm_text(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def issues_overlap(a, b):
    """Rough semantic agreement: shared category + shared non-trivial token."""
    ta = norm_text(a["description"] + " " + a["category"])
    tb = norm_text(b["description"] + " " + b["category"])
    wa = set(w for w in ta.split() if len(w) > 3)
    wb = set(w for w in tb.split() if len(w) > 3)
    if not wa or not wb:
        return False
    overlap = wa & wb
    return len(overlap) >= max(2, min(len(wa), len(wb)) // 2)


def build_consensus(gemma, nemotron, frame_count):
    reports = []
    if gemma:
        reports.append(("gemma", gemma))
    if nemotron:
        reports.append(("nemotron", nemotron))

    scores = {n: r.get("overall_score", 0) for n, r in reports}
    weights = {"gemma": WEIGHT_GEMMA, "nemotron": WEIGHT_NEMOTRON}
    if scores:
        total_w = sum(weights.get(n, 1.0) for n in scores)
        avg = round(sum(s * weights.get(n, 1.0) for n, s in scores.items()) / total_w)
    else:
        avg = 0

    # design compliance: weighted average across reviewers that reported it
    comps = {n: r.get("design_compliance") for n, r in reports
             if r.get("design_compliance") is not None}
    if comps:
        comp_total_w = sum(weights.get(n, 1.0) for n in comps)
        compliance = round(sum(c * weights.get(n, 1.0) for n, c in comps.items()) / comp_total_w)
    else:
        compliance = None

    paired = []
    for i, (n1, r1) in enumerate(reports):
        for n2, r2 in reports[i + 1 :]:
            for a in r1.get("issues", []):
                for b in r2.get("issues", []):
                    if issues_overlap(a, b):
                        paired.append((a, b, n1, n2))

    used = set()
    high_conf = []
    for a, b, n1, n2 in paired:
        key = (id(a), id(b))
        if key in used:
            continue
        used.add(key)
        high_conf.append({
            "models": [n1, n2],
            "category": a["category"],
            "frame": a["frame"],
            "description": a["description"],
            "recommended_direction": a["recommended_direction"] or b["recommended_direction"],
            "severity": "critical" if "critical" in (a["severity"], b["severity"]) else "high",
            "agreement": "2/2",
            "confidence": "HIGH",
        })

    single = []
    paired_a_ids = {id(a) for a, b, _, _ in paired} | {id(b) for a, b, _, _ in paired}
    for name, r in reports:
        for it in r.get("issues", []):
            if id(it) in paired_a_ids:
                continue
            # Gemma is the stronger vision reviewer; a Gemma-only finding that
            # Nemotron missed is still worth elevated attention (HIGH when
            # severe), not downgraded to MEDIUM.
            if name == "gemma" and it["severity"] in ("critical", "high"):
                conf = "HIGH"
            elif name == "gemma":
                conf = "MEDIUM-HIGH"
            else:
                conf = "MEDIUM"
            single.append({
                "model": name,
                "category": it["category"],
                "frame": it["frame"],
                "description": it["description"],
                "recommended_direction": it["recommended_direction"],
                "severity": it["severity"],
                "confidence": conf,
            })

    strengths = []
    seen = set()
    for _, r in reports:
        for s in r.get("strengths", []):
            key = norm_text(s)[:60]
            if key not in seen:
                seen.add(key)
                strengths.append(s)

    ready_flags = [r.get("ready_for_final", False) for _, r in reports]
    all_ready = bool(reports) and all(ready_flags)
    no_critical = not any(i["severity"] == "critical" for i in high_conf) and \
                  not any(i["severity"] == "critical" for i in single)
    approved = avg >= MIN_SCORE and no_critical and all_ready

    return {
        "gemma_score": scores.get("gemma"),
        "nemotron_score": scores.get("nemotron"),
        "overall_score": avg,
        "design_compliance": compliance,
        "min_score": MIN_SCORE,
        "approved": approved,
        "high_confidence_issues": high_conf,
        "single_model_issues": single,
        "disagreements": [s for s in single if len(scores) == 2],
        "strengths": strengths,
        "reviewers_used": [n for n, _ in reports],
    }


# ---------------------------------------------------------------- persistence

def save_iteration(iteration_num, source, frames, gemma, nemotron, consensus):
    d = ITER_DIR / f"iteration_{iteration_num:03d}"
    d.mkdir(parents=True, exist_ok=True)
    if is_video(source) or is_image(source):
        shutil.copy2(source, d / source.name)
    fd = d / "frames"
    fd.mkdir(exist_ok=True)
    for f in frames:
        shutil.copy2(f, fd / Path(f).name)
    (d / "gemma.json").write_text(json.dumps(gemma, indent=2, ensure_ascii=False))
    if nemotron:
        (d / "nemotron.json").write_text(json.dumps(nemotron, indent=2, ensure_ascii=False))
    (d / "consensus.json").write_text(json.dumps(consensus, indent=2, ensure_ascii=False))
    return d


def next_iteration_num():
    if not ITER_DIR.exists():
        return 1
    nums = []
    for p in ITER_DIR.glob("iteration_*"):
        try:
            nums.append(int(p.name.split("_")[1]))
        except (IndexError, ValueError):
            continue
    return (max(nums) + 1) if nums else 1


# ---------------------------------------------------------------- compare

def load_iteration(name):
    p = ITER_DIR / name
    if not (p / "consensus.json").exists():
        return None
    return json.loads((p / "consensus.json").read_text())


def compare_iterations(a_name, b_name):
    a = load_iteration(a_name)
    b = load_iteration(b_name)
    if a is None or b is None:
        raise RuntimeError(f"could not load iterations: {a_name} / {b_name}")
    a_score = a.get("overall_score", 0)
    b_score = b.get("overall_score", 0)
    delta = b_score - a_score

    a_high = {(i["category"], i["frame"], norm_text(i["description"])[:50])
              for i in a.get("high_confidence_issues", [])}
    b_high = {(i["category"], i["frame"], norm_text(i["description"])[:50])
              for i in b.get("high_confidence_issues", [])}
    fixed = a_high - b_high
    new = b_high - a_high

    return {
        "from": a_name,
        "to": b_name,
        "score_before": a_score,
        "score_after": b_score,
        "delta": delta,
        "improved": b_score > a_score,
        "fixed_issues": len(fixed),
        "new_issues": len(new),
        "verdict": (
            "IMPROVED" if b_score >= a_score + 3 else
            "REGRESSED" if b_score <= a_score - 3 else
            "UNCHANGED"
        ),
    }


# ---------------------------------------------------------------- reporting

def render_human_report(c):
    lines = ["", "VISUAL QA CONSENSUS"]
    lines.append(f"Gemma score: {c['gemma_score'] if c['gemma_score'] is not None else 'n/a'}/100")
    lines.append(f"Nemotron score: {c['nemotron_score'] if c['nemotron_score'] is not None else 'n/a'}/100")
    comp = c.get("design_compliance")
    comp_s = f"{comp}/100" if comp is not None else "n/a"
    lines.append(f"Design compliance: {comp_s}")
    lines.append(f"Overall: {c['overall_score']}/100  |  MIN: {c['min_score']}  |  APPROVED: {c['approved']}")
    lines.append("")
    if c["high_confidence_issues"]:
        lines.append("HIGH-CONFIDENCE ISSUES (2/2 agreement):")
        for i in c["high_confidence_issues"]:
            lines.append(f"  - [{i['severity']}/{i['confidence']}] {i['category']} @frame {i['frame']}: {i['description']}")
            if i.get("recommended_direction"):
                lines.append(f"      -> {i['recommended_direction']}")
    if c["single_model_issues"]:
        lines.append("SINGLE-MODEL OBSERVATIONS:")
        for i in c["single_model_issues"]:
            lines.append(f"  - [{i['model']}/{i['confidence']}] {i['category']} @frame {i['frame']}: {i['description']}")
    if c["strengths"]:
        lines.append("STRENGTHS:")
        for s in c["strengths"][:5]:
            lines.append(f"  - {s}")
    lines.append("")
    lines.append("RECOMMENDATION: fix high-confidence issues first; treat single-model observations as advisory.")
    lines.append(f"READY FOR FINAL: {'YES' if c['approved'] else 'NO'}")
    return "\n".join(lines)


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="Dual-vision QA for Remotion renders")
    ap.add_argument("target", nargs="?", help="path to render (mp4/png/jpg/webp)")
    ap.add_argument("--compare", nargs=2, metavar=("ITER_A", "ITER_B"),
                    help="compare two saved iterations")
    ap.add_argument("--report", action="store_true",
                    help="print only the machine-readable consensus JSON to stdout")
    ap.add_argument("--frames", type=int, default=None, help="override frame count")
    ap.add_argument("--only", choices=["gemma", "nemotron"], default=None)
    args = ap.parse_args()

    if args.compare:
        result = compare_iterations(*args.compare)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0

    if not args.target:
        ap.error("a target file (image or video) is required")

    source = Path(args.target).resolve()
    if not source.exists():
        log(f"render file missing: {source}")
        sys.exit(2)
    if source.stat().st_size == 0:
        log("render file is empty")
        sys.exit(2)
    if not (is_image(source) or is_video(source)):
        log(f"unsupported format: {source.suffix}")
        sys.exit(2)

    count = args.frames or FRAME_COUNT
    work = WORK_DIR / hash_file(source)
    work.mkdir(parents=True, exist_ok=True)

    if is_video(source):
        frames = extract_frames(source, work, count, MAX_WIDTH)
    else:
        frames = prepare_single_image(source, work, MAX_WIDTH)

    # cache: identical evidence => identical result
    def _safe(s):
        return re.sub(r"[^A-Za-z0-9_.-]", "_", s)

    # design direction hash: if the design doc changes, cached verdicts are stale
    design_hash = hashlib.sha256(DESIGN_DIRECTION.encode()).hexdigest()[:8]
    cache_key = (hash_frames(frames) + f"_{_safe(MODEL_GEMMA)}_{_safe(MODEL_NEMOTRON)}"
                 + f"_dd{design_hash}")
    cache_path = CACHE_DIR / f"{cache_key}.json"
    if cache_path.exists():
        log("cache hit — returning cached result")
        cached = json.loads(cache_path.read_text())
        if args.report:
            print(json.dumps(cached["consensus"], ensure_ascii=False))
        else:
            print(render_human_report(cached["consensus"]))
        return 0

    gemma = nemotron = None
    failures = []

    if ENABLE_GEMMA and args.only in (None, "gemma"):
        try:
            gemma = run_reviewer("gemma", MODEL_GEMMA, frames, SYSTEM_GEMMA)
        except Exception as e:
            failures.append(f"gemma: {e}")
            log(f"gemma failed: {e}")
    if ENABLE_NEMOTRON and args.only in (None, "nemotron"):
        try:
            nemotron = run_reviewer("nemotron", MODEL_NEMOTRON, frames, SYSTEM_NEMOTRON)
        except Exception as e:
            failures.append(f"nemotron: {e}")
            log(f"nemotron failed: {e}")

    if gemma is None and nemotron is None:
        log("both vision models failed — no consensus possible")
        log("; ".join(failures))
        print(json.dumps({"error": "both reviewers failed", "details": failures,
                          "reviewers_used": []}))
        sys.exit(3)

    consensus = build_consensus(gemma, nemotron, len(frames))
    consensus["failures"] = failures

    # persist
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps({
        "evidence_hash": cache_key,
        "source": str(source),
        "gemma": gemma,
        "nemotron": nemotron,
        "consensus": consensus,
    }, indent=2, ensure_ascii=False))

    iteration = next_iteration_num()
    if iteration <= MAX_ITERATIONS:
        it_dir = save_iteration(iteration, source, frames, gemma, nemotron, consensus)
        log(f"saved iteration history -> {it_dir}")
    else:
        log(f"max iterations ({MAX_ITERATIONS}) reached — stopping, not overwriting history")

    if args.report:
        print(json.dumps(consensus, ensure_ascii=False))
    else:
        print(render_human_report(consensus))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as e:
        log(f"error: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
