"""Central configuration for the Sylvester's AI Lab automation pipeline.

All secrets are read from environment variables (or a .env file next to this
module). Nothing sensitive is hard-coded here.
"""

import os
import time
from pathlib import Path

# Load .env (next to this file) BEFORE reading any os.getenv below.
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except Exception:
    pass

# ----------------------------------------------------------------------------
# Paths — derived from this file's location so they work on the phone,
# in Colab (/content/ai-lab-internal), and on CI runners (any checkout dir).
# ----------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent   # Remotion project root
PIPELINE_DIR = PROJECT_ROOT / "pipeline"
WORKSPACE = PIPELINE_DIR / "workspace"                  # per-topic working dirs

REMOTION_PROJECT_DIR = PROJECT_ROOT
REMOTION_OUT_DIR = PROJECT_ROOT / "out"

# The Remotion <Composition> id registered in src/Root.tsx.
# "Episode" consumes the pipeline's script.json + voiceover.
# List yours with:  npm run compositions
REMOTION_COMPOSITION_ID = os.getenv("REMOTION_COMPOSITION_ID", "Episode")
# Path to the Chromium/Chrome binary Remotion renders with. On Termux/Android
# this is the system chromium; on Colab/desktop set it to that machine's binary
# (e.g. /usr/bin/chromium). If empty, Remotion uses its bundled/default browser.
REMOTION_BROWSER_EXECUTABLE = os.getenv(
    "REMOTION_BROWSER_EXECUTABLE",
    "/data/data/com.termux/files/usr/bin/chromium-browser",
)
# Batch render settings. Headless Chromium on mobile renders ~6s/frame, so we
# split a long composition into resumable segments (crash-safe) and concatenate.
# Empty = let Remotion auto-pick concurrency. Raise on multi-core machines.
REMOTION_CONCURRENCY = os.getenv("REMOTION_CONCURRENCY", "2")
# Frames per render segment (~60s @30fps). Smaller = more resumable, more joins.
RENDER_BATCH_FRAMES = int(os.getenv("RENDER_BATCH_FRAMES", "1800"))

# ----------------------------------------------------------------------------
# Gemini (script generation) — free tier via Google AI Studio
# ----------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Gemini 2.5 Flash has a generous free tier. Bump to gemini-2.5-pro for quality.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
# Where the generated script JSON lives, consumed by the Remotion scene.
SCRIPT_JSON_REL = "script.json"
# Where first-hand YouTube research lives (produced by topic_research.py).
RESEARCH_JSON_REL = "research.json"

# ----------------------------------------------------------------------------
# YouTube Data API (upload)
# ----------------------------------------------------------------------------
YOUTUBE_CLIENT_SECRETS = os.getenv(
    "YOUTUBE_CLIENT_SECRETS", str(PROJECT_ROOT / "client_secrets.json")
)
YOUTUBE_TOKEN = os.getenv(
    "YOUTUBE_TOKEN", str(PIPELINE_DIR / "youtube_token.json")
)
YOUTUBE_CATEGORY_ID = os.getenv("YOUTUBE_CATEGORY_ID", "28")  # 28 = Sci & Tech
YOUTUBE_PRIVACY = os.getenv("YOUTUBE_PRIVACY", "private")     # or "public"/"unlisted"
# Simple Data API key (AIza...) used for trend research — NOT the OAuth secret.
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# ----------------------------------------------------------------------------
# Telegram (notifier)
# ----------------------------------------------------------------------------
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "8800205878")

# ----------------------------------------------------------------------------
# Voiceover / audio
# ----------------------------------------------------------------------------
# Filename the pipeline writes/reads inside each topic workspace.
VOICEOVER_FILENAME = os.getenv("VOICEOVER_FILENAME", "voiceover.mp3")
# "auto"  = generate voiceover with Edge TTS before render (no manual upload)
# "manual" = pause and wait for you to drop a kikivoice.ai export here
VOICEOVER_MODE = os.getenv("VOICEOVER_MODE", "auto")
# Edge TTS voice used in auto mode.
TTS_VOICE = os.getenv("TTS_VOICE", "en-US-GuyNeural")
# How long (seconds) to poll for the audio file before timing out. 0 = forever.
AUDIO_WAIT_TIMEOUT = int(os.getenv("AUDIO_WAIT_TIMEOUT", "0"))
AUDIO_POLL_INTERVAL = int(os.getenv("AUDIO_POLL_INTERVAL", "15"))

# Politely fail fast if required secrets are missing.
def require(*names):
    missing = [n for n in names if not globals().get(n)]
    if missing:
        raise RuntimeError(
            "Missing required config: " + ", ".join(missing) +
            "\nSet them in the environment or a .env file in pipeline/."
        )


def gemini_generate(client, model, contents, gen_config, attempts: int = 8):
    """Call Gemini with retry/backoff on 429 (RESOURCE_EXHAUSTED) rate limits.

    The free tier has a tiny quota (20 req/day for some models), so the pipeline
    must wait out short rate-limit windows instead of failing or silently
    falling back to low-quality defaults.
    """
    last = None
    for i in range(attempts):
        try:
            return client.models.generate_content(
                model=model, contents=contents, config=gen_config
            )
        except Exception as exc:  # noqa: BLE001
            msg = str(exc)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                wait = min(2 ** i * 5, 60)
                print(
                    f"[gemini] quota/429 hit; backing off {wait}s "
                    f"(attempt {i + 1}/{attempts})"
                )
                time.sleep(wait)
                last = exc
                continue
            raise
    raise last or RuntimeError("gemini_generate exhausted retries")

# Secrets that must never be logged.
SECRET_KEYS = ("GEMINI_API_KEY", "TELEGRAM_BOT_TOKEN", "ANTHROPIC_API_KEY")
