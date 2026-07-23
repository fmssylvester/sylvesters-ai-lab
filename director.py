"""
Director Agent — expands a raw idea into a cinematic, model-ready prompt.

Mirrors scripts/vision.py: plain urllib, no third-party deps, multi-backend
fallback (Gemini -> OpenRouter). Used by launch_app.generate_video when the
user enables "Auto-Direct".
"""

import os
import json
import time
import urllib.request
import urllib.error


def _post(url, payload, headers, timeout=60, tries=3, backoff=2.0):
    last = None
    data = json.dumps(payload).encode()
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            # hard-stop on auth/permission errors
            if e.code in (400, 401, 403):
                raise
            last = e
            # retry rate-limits with backoff
            if e.code == 429 and i < tries - 1:
                time.sleep(backoff * (i + 1))
                continue
        except Exception as e:
            last = e
    raise last if last else RuntimeError("director: no request made")


DIRECTOR_SYSTEM = (
    "You are the Director of Photography for a high-end AI film studio. "
    "Your job: turn the user's rough idea into a single, richly detailed visual "
    "prompt for a text-to-video diffusion model (LTX-Video). "
    "Output ONLY the prompt text, no preamble, no quotes, no markdown. "
    "Weave in, where relevant: subject & action, shot size (close-up, wide, "
    "establishing), camera move (slow dolly-in, handheld, low-angle, aerial "
    "drone, orbit), lens & depth (85mm portrait, 35mm, anamorphic, shallow "
    "depth of field, bokeh), lighting (golden hour, neon noir, soft key, "
    "volumetric haze, backlit), palette & mood, atmosphere (fog, rain, dust, "
    "smoke), motion quality (slow cinematic drift, dynamic, steady), and finish "
    "(film grain, 35mm, cinematic, hyper-detailed). "
    "Keep it under 70 words, vivid and concrete, focused on what is SEEN and "
    "how the camera MOVES. Never describe audio or editing."
)


def _gemini_text(user_text, system, model="gemini-3-flash-preview"):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"parts": [{"text": user_text}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300},
    }
    headers = {"Content-Type": "application/json"}
    data = _post(url, payload, headers)
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def _openrouter_text(user_text, system, model=None):
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        return None
    model = model or os.environ.get("OPENROUTER_MODEL") or "google/gemma-4-26b-a4b-it:free"
    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_text},
        ],
        "temperature": 0.7,
        "max_tokens": 300,
    }
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
    data = _post(url, payload, headers)
    return data["choices"][0]["message"]["content"].strip()


def direct_prompt(raw_idea, system=DIRECTOR_SYSTEM):
    """Expand a raw idea into a cinematic prompt. Tries Gemini then OpenRouter."""
    if not raw_idea or not raw_idea.strip():
        return raw_idea
    last_err = None
    for name, fn in (("gemini", _gemini_text), ("openrouter", _openrouter_text)):
        try:
            out = fn(raw_idea, system)
            if out:
                return out
        except Exception as e:
            last_err = e
    # If both fail, return the original so generation still proceeds.
    return raw_idea


if __name__ == "__main__":
    import sys
    idea = sys.argv[1] if len(sys.argv) > 1 else "a lonely robot discovers a flower in a ruined city"
    print("RAW:", idea)
    print("DIRECTED:", direct_prompt(idea))
