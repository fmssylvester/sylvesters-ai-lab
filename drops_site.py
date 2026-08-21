"""Sylvester's Channel Drops — public asset site served from Termux.

Lists and serves assets stored in the R2 `drops/` prefix. No Cloudflare API
token needed: a `cloudflared` quick tunnel exposes this local server to the
public (same mechanism the lab uses).

Run:  python drops_site.py            (binds 127.0.0.1:8787)
Then:  ./cloudflared tunnel --url http://127.0.0.1:8787
"""
import os
import io
import sys
import html
import datetime
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRETS_PATH = "/data/data/com.termux/files/home/ai-lab-internal/secrets.txt"
PREFIX = "drops"
PORT = 8787
HOST = "127.0.0.1"

_BG = "#07090D"
_CYAN = "#00D9FF"
_GOLD = "#E7B84D"

_CTYPES = {
    "": "application/octet-stream",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".safetensors": "application/octet-stream",
    ".zip": "application/zip",
    ".pt": "application/octet-stream",
    ".pth": "application/octet-stream",
    ".ply": "application/octet-stream",
    ".gguf": "application/octet-stream",
    ".ckpt": "application/octet-stream",
    ".pdf": "application/pdf",
}

_INLINE = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".mov", ".webm",
           ".pdf", ".txt", ".md", ".json", ".svg"}


def _secrets():
    d = {}
    try:
        for line in open(SECRETS_PATH):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            d[k.strip()] = v.strip()
    except Exception:
        pass
    return d


def _client():
    import boto3
    from botocore.client import Config
    s = _secrets()
    return boto3.client(
        "s3",
        endpoint_url=f"https://{s['CF_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=s.get("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=s.get("R2_ACCESS_KEY_SECRET") or s.get("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _bucket():
    return _secrets().get("R2_BUCKET", "r2-bucket")


def _ext(name):
    return os.path.splitext(name)[1].lower()


def _ctype(key):
    return _CTYPES.get(_ext(key), "application/octet-stream")


def _human(n):
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024:
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} PB"


def _list():
    out = []
    try:
        r = _client().list_objects_v2(Bucket=_bucket(), Prefix=PREFIX + "/", MaxKeys=500)
        for o in (r.get("Contents") or []):
            k = o["Key"]
            out.append({
                "key": k,
                "name": os.path.basename(k),
                "size": o.get("Size", 0),
                "mod": str(o.get("LastModified")),
                "ext": _ext(k),
            })
    except Exception as e:
        out = [{"error": str(e)}]
    out.sort(key=lambda x: x.get("key", ""), reverse=True)
    return out


def _gallery():
    items = _list()
    if items and "error" in items[0]:
        rows = f'<p style="color:#ff6b6b">R2 error: {html.escape(items[0]["error"])}</p>'
    elif not items:
        rows = '<p style="opacity:.6">No drops yet. Send a file or text to Sylvester via <b>/drop</b>.</p>'
    else:
        cards = []
        for it in items:
            enc = urllib.parse.quote(it["key"])
            dl = f"/d/{enc}"
            thumb = ""
            if it["ext"] in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
                thumb = (f'<a href="{dl}" target="_blank">'
                         f'<img src="{dl}" loading="lazy" style="width:100%;height:150px;'
                         f'object-fit:cover;border-radius:10px;"></a>')
            elif it["ext"] in (".mp4", ".mov", ".webm"):
                thumb = (f'<video src="{dl}" muted playsinline preload="none" '
                         f'style="width:100%;height:150px;object-fit:cover;border-radius:10px;"></video>')
            else:
                icon = {"txt": "📝", "md": "📝", "json": "🔧", "safetensors": "🧠",
                        "pt": "🧠", "pth": "🧠", "gguf": "🧠", "zip": "🗜️"}.get(it["ext"].lstrip("."), "📦")
                thumb = (f'<div style="height:150px;display:flex;align-items:center;justify-content:center;'
                         f'font-size:48px;opacity:.7">{icon}</div>')
            size = _human(it["size"])
            try:
                when = datetime.datetime.fromisoformat(it["mod"].replace("Z", "+00:00")).strftime("%b %d %H:%M UTC")
            except Exception:
                when = it["mod"]
            cards.append(f"""
            <div class="card">
              {thumb}
              <div class="meta">
                <div class="name" title="{html.escape(it['name'])}">{html.escape(it['name'])}</div>
                <div class="sub">{size} · {html.escape(when)}</div>
                <a class="btn" href="{dl}" download="{html.escape(it['name'])}">Download</a>
              </div>
            </div>""")
        rows = '<div class="grid">' + "".join(cards) + "</div>"

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sylvester · Channel Drops</title>
<style>
  :root{{--bg:{_BG};--cyan:{_CYAN};--gold:{_GOLD}}}
  *{{box-sizing:border-box}}
  body{{margin:0;background:radial-gradient(1200px 600px at 70% -10%,#0d1622,var(--bg));
       color:#e8eef5;font:15px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}}
  header{{padding:28px 26px 10px}}
  h1{{margin:0;font-size:26px;letter-spacing:.5px}}
  h1 b{{color:var(--cyan)}} .g{{color:var(--gold)}}
  .tag{{opacity:.6;font-size:13px;margin-top:4px}}
  .bar{{padding:0 26px 18px;position:sticky;top:0;background:rgba(7,9,13,.85);backdrop-filter:blur(6px);padding-top:14px;padding-bottom:14px}}
  input{{width:100%;max-width:640px;padding:11px 14px;border-radius:10px;border:1px solid #1c2733;
        background:#0b1018;color:#e8eef5;font-size:14px;outline:none}}
  input:focus{{border-color:var(--cyan)}}
  .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;padding:6px 26px 40px}}
  .card{{background:#0b1018;border:1px solid #16202c;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}}
  .meta{{padding:12px 14px 14px}}
  .name{{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
  .sub{{opacity:.55;font-size:12px;margin:3px 0 10px}}
  .btn{{display:inline-block;padding:7px 12px;border-radius:9px;background:var(--cyan);color:#04121a;
        font-weight:700;text-decoration:none;font-size:13px}}
  .btn:hover{{filter:brightness(1.1)}}
  footer{{padding:18px 26px 40px;opacity:.4;font-size:12px}}
</style></head>
<body>
  <header>
    <h1><b>Sylvester</b> <span class="g">· Channel Drops</span></h1>
    <div class="tag">Assets dropped by the channel — models, prompts, images, video. Powered by Cloudflare R2.</div>
  </header>
  <div class="bar"><input id="q" placeholder="Filter assets…" oninput="f(this.value)"></div>
  <div id="grid">{rows}</div>
  <footer>Sylvester's AI Lab</footer>
  <script>
    function f(v){{
      v=v.toLowerCase();
      document.querySelectorAll('.card').forEach(c=>{{
        const t=c.querySelector('.name').textContent.toLowerCase();
        c.style.display = t.includes(v)?'':'none';
      }});
    }}
  </script>
</body></html>"""


class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="text/html; charset=utf-8", extra=None):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if extra:
            for k, v in extra.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/" or path == "":
            self._send(200, _gallery())
            return
        if path.startswith("/d/"):
            key = urllib.parse.unquote(path[3:])
            if not key.startswith(PREFIX + "/"):
                self._send(400, "bad key")
                return
            try:
                obj = _client().get_object(Bucket=_bucket(), Key=key)
                data = obj["Body"].read()
                ctype = obj.get("ContentType") or _ctype(key)
                name = os.path.basename(key)
                disp = "inline" if _ext(key) in _INLINE else "attachment"
                self._send(200, data, ctype,
                           {"Content-Disposition": f'{disp}; filename="{name}"'})
            except Exception as e:
                self._send(404, f"not found: {html.escape(str(e))}")
            return
        self._send(404, "not found")

    def log_message(self, *a):
        pass


def main():
    srv = ThreadingHTTPServer((HOST, PORT), H)
    print(f"drops site on http://{HOST}:{PORT}", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
