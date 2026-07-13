import sys
import os
import base64
import json
import time
import urllib.request
import urllib.error

def urlopen_retry(req, timeout=45, tries=3, pause=1.5):
    last = None
    for _ in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
        except (urllib.error.HTTPError,):
            raise
        except Exception as e:
            last = e
            time.sleep(pause)
    raise last if last else RuntimeError("urlopen_retry: no attempts made")

def check_local(image_path, question, model="moondream"):
    try:
        import ollama
    except Exception:
        return None
    last = None
    for _ in range(1):
        try:
            response = ollama.chat(
                model=model,
                messages=[{
                    "role": "user",
                    "content": question,
                    "images": [image_path]
                }]
            )
            content = (response.get("message", {}).get("content") or "").strip()
            if content:
                return content
            last = content
        except Exception as e:
            last = str(e)
    return None

def check_gemini(image_path, question):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
        payload = {
            "contents": [{
                "parts": [
                    {"text": question},
                    {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}}
                ]
            }]
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                      headers={"Content-Type": "application/json"})
        with urlopen_retry(req, timeout=30) as resp:
            data = json.loads(resp.read())
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return None

def check_nvidia(image_path, question):
    key = os.environ.get("NVIDIA_API_KEY")
    if not key:
        return None
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        model = os.environ.get("NVIDIA_MODEL", "meta/llama-3.2-11b-vision-instruct")
        payload = {
            "model": model,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                ]
            }],
            "max_tokens": 1024,
        }
        req = urllib.request.Request(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
        )
        with urlopen_retry(req, timeout=45) as resp:
            data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return None


def check_github(image_path, question):
    token = os.environ.get("GITHUB_MODELS_TOKEN")
    if not token:
        return None
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        model = os.environ.get("GITHUB_MODEL", "openai/gpt-4o")
        payload = {
            "model": model,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                ]
            }],
            "max_tokens": 1024,
        }
        url = "https://models.github.ai/inference/chat/completions"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
        )
        with urlopen_retry(req, timeout=45) as resp:
            data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return None


def check_cloudflare(image_path, question):
    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not token or not account:
        return None
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        model = os.environ.get("CLOUDFLARE_MODEL", "@cf/meta/llama-3.2-11b-vision-instruct")
        payload = {"prompt": question, "image": f"data:image/png;base64,{img_b64}"}
        url = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{model}"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
        )
        with urlopen_retry(req, timeout=45) as resp:
            data = json.loads(resp.read())
        if data.get("success"):
            return data["result"]["response"]
        return None
    except Exception as e:
        return None


def check_openrouter(image_path, question):
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        return None
    try:
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        payload = {
            "model": os.environ.get("OPENROUTER_MODEL", "google/gemma-4-26b-a4b-it:free"),
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                ]
            }]
        }
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
        )
        with urlopen_retry(req, timeout=30) as resp:
            data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return None

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/vision.py '<question>' <image_path>")
        sys.exit(1)

    question = sys.argv[1]
    image_path = sys.argv[2]

    order = [("github", check_github), ("openrouter", check_openrouter), ("nvidia", check_nvidia), ("cloudflare", check_cloudflare), ("local", check_local), ("gemini", check_gemini)]
    override = os.environ.get("VISION_BACKEND")
    if override:
        order = [(override, {"local": check_local, "gemini": check_gemini, "nvidia": check_nvidia, "openrouter": check_openrouter, "cloudflare": check_cloudflare, "github": check_github}[override])]

    for name, fn in order:
        result = fn(image_path, question)
        if result:
            print(f"[{name}] {result}")
            return

    print("All vision backends failed or unavailable.")

if __name__ == "__main__":
    main()
