#!/usr/bin/env python3
"""
freesound.py — search & download sound effects from FreeSound.org API.

Usage:
  python3 freesound.py search "whoosh" --min-dur 0 --max-dur 5 --limit 5
  python3 freesound.py download 807297 /tmp/sfx/whoosh.mp3
  python3 freesound.py info 807297

Env: FREESOUND_API_KEY (sourced from /root/.freesound.env)
"""
import argparse, base64, json, os, sys, urllib.parse, urllib.request, urllib.error

BASE = "https://freesound.org/apiv2"
KEY = os.environ.get("FREESOUND_API_KEY", "")

def _req(path, params=None):
    if not KEY:
        sys.exit("FREESOUND_API_KEY not set (run: source /root/.freesound.env)")
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    r = urllib.request.Request(url, headers={"Authorization": f"Token {KEY}"})
    with urllib.request.urlopen(r, timeout=45) as resp:
        return json.loads(resp.read())

def search(query, min_dur=None, max_dur=None, limit=5):
    f = []
    if min_dur is not None and max_dur is not None:
        f.append(f"duration:[{min_dur} TO {max_dur}]")
    elif min_dur is not None:
        f.append(f"duration:[{min_dur} TO 999]")
    elif max_dur is not None:
        f.append(f"duration:[0 TO {max_dur}]")
    params = {"query": query, "page_size": limit, "fields": "id,name,duration,previews,license,download"}
    if f:
        params["filter"] = ",".join(f)
    d = _req("/search/text/", params)
    print(f"'{query}' -> {d.get('count')} results")
    for s in d.get("results", []):
        print(f"  id={s.get('id')}  {s.get('duration'):>5.1f}s  {s.get('name')}")

def info(sid):
    s = _req(f"/sounds/{sid}/", {"fields": "id,name,duration,previews,license,download,username"})
    print(json.dumps(s, indent=1)[:1200])

def download(sid, out):
    s = _req(f"/sounds/{sid}/", {"fields": "id,name,duration,previews,license,download,username"})
    p = s.get("previews", {}) or {}
    url = p.get("preview-hq-mp3") or p.get("preview-lq-mp3") or p.get("preview-hq-ogg") or p.get("preview-lq-ogg")
    if not url:
        # full-quality download via OAuth-proxied endpoint
        try:
            req = urllib.request.Request(
                f"{BASE}/sounds/{sid}/download/",
                headers={"Authorization": f"Token {KEY}"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
            with open(out, "wb") as fh:
                fh.write(data)
            print(f"saved auth-download {len(data)} bytes -> {out}")
            return
        except urllib.error.HTTPError as e:
            print("auth download failed:", e.code, e.read().decode()[:200])
            return
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    with urllib.request.urlopen(url, timeout=60) as resp:
        data = resp.read()
    with open(out, "wb") as fh:
        fh.write(data)
    print(f"saved preview {len(data)} bytes -> {out}")

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__); sys.exit(1)
    cmd = args[0]
    if cmd == "search":
        q = args[1] if len(args) > 1 else sys.exit("usage: search <query>")
        kwargs = {}
        for i, a in enumerate(args[2:], 2):
            if a.startswith("--min"): kwargs["min_dur"] = float(args[i+1])
            elif a.startswith("--max"): kwargs["max_dur"] = float(args[i+1])
            elif a.startswith("--limit"): kwargs["limit"] = int(args[i+1])
        search(q, **kwargs)
    elif cmd == "info":
        info(int(args[1]))
    elif cmd == "download":
        download(int(args[1]), args[2] if len(args) > 2 else f"/tmp/sfx_{args[1]}.mp3")
    else:
        sys.exit(f"unknown cmd: {cmd}")