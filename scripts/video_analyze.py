#!/usr/bin/env python3
"""
Video Analysis Tool — uses Gemini to WATCH and analyze full videos.
Unlike vision.py (frame-by-frame), this uploads the video to Gemini
and gets holistic analysis of narrative flow, transitions, and motion.

Usage:
  python3 scripts/video_analyze.py <video_path> "<question>"
  python3 scripts/video_analyze.py <video_path> "analyze narrative flow"
  python3 scripts/video_analyze.py <video_path> "score motion graphics quality 1-10"
"""

import sys
import os
import time

MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
]


def try_analyze(client, uploaded_file, question, model):
    from google.genai import types
    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_uri(
                        file_uri=uploaded_file.uri,
                        mime_type=uploaded_file.mime_type,
                    ),
                    types.Part.from_text(text=question),
                ],
            )
        ],
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=4096,
        ),
    )
    return response.text


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    video_path = sys.argv[1]
    question = sys.argv[2]

    if not os.path.exists(video_path):
        print(f"Error: Video not found: {video_path}")
        sys.exit(1)

    size_mb = os.path.getsize(video_path) / (1024 * 1024)
    print(f"Video: {video_path} ({size_mb:.1f} MB)")
    print(f"Question: {question}")
    print()

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("Error: google-genai not installed. Run: pip install google-genai")
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    # Upload video
    print("Uploading video to Gemini...")
    try:
        uploaded_file = client.files.upload(file=video_path)
        print(f"Uploaded: {uploaded_file.name}")
    except Exception as e:
        print(f"Upload error: {e}")
        sys.exit(1)

    # Wait for processing
    print("Waiting for video processing...")
    max_wait = 300
    waited = 0
    while waited < max_wait:
        try:
            file_info = client.files.get(name=uploaded_file.name)
            state = file_info.state
            if state == "ACTIVE":
                print(f"Video ready (took {waited}s)")
                break
            elif state == "FAILED":
                print(f"Video processing failed: {file_info.error}")
                sys.exit(1)
            time.sleep(5)
            waited += 5
            if waited % 15 == 0:
                print(f"  Still processing... ({waited}s)")
        except Exception as e:
            print(f"Status check error: {e}")
            time.sleep(5)
            waited += 5

    if waited >= max_wait:
        print("Timeout waiting for video processing")
        sys.exit(1)

    # Try models with fallback
    print("\nAnalyzing video...")
    last_error = None
    success = False
    for model in MODELS:
        try:
            result = try_analyze(client, uploaded_file, question, model)
            print(f"\n(model: {model})")
            print("=" * 60)
            print("ANALYSIS RESULT")
            print("=" * 60)
            print(result)
            print("=" * 60)
            success = True
            break
        except Exception as e:
            last_error = e
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                print(f"  {model}: quota exhausted, trying next...")
                time.sleep(2)
                continue
            elif "404" in err_str:
                print(f"  {model}: not available, trying next...")
                continue
            else:
                print(f"  {model}: {e}")
                break

    if not success:
        print(f"\nAll models failed. Last error: {last_error}")
        sys.exit(1)

    # Clean up
    try:
        client.files.delete(name=uploaded_file.name)
        print("\nCleaned up uploaded file.")
    except:
        pass


if __name__ == "__main__":
    main()
