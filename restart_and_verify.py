import os, sys, json, time, re

# Stable dir (always mounted); avoid the lazy-mounted lightning-ai path.
STABLE = "/data/data/com.termux/files/home/ai-lab-internal"
sys.path.insert(0, STABLE)
import sdk_patch
from lightning_sdk import Studio

ACC = json.load(open(STABLE + "/accounts.json"))
A = next(a for a in ACC["accounts"] if a["name"] == "acct_ugurujuliet7")
CLOUD = A.get("cloud") or ACC.get("cloud", "lightning-public-prod")
os.environ["LIGHTNING_API_KEY"] = A["api_key"]
os.environ["LIGHTNING_USER_ID"] = A["user"]
s = Studio(name="teammate-2-deploy-model-aws", teamspace=A["teamspace"], user=A["user"], cloud=CLOUD)

def sdk(fn, n=10):
    last = None
    for _ in range(n):
        try:
            return fn()
        except Exception as e:
            last = e
            time.sleep(4)
    raise last

pat = re.compile(r"https://[a-z0-9\-]+\.trycloudflare\.com")

# ---- PART 1: verify Upscale 4x fix in a FRESH studio process (re-imports patched upscaler) ----
verify = r'''
import sys, os, traceback
sys.path.insert(0, "/teamspace/studios/this_studio")
import launch_app as L
class P:
    def __init__(self): pass
    def __call__(self, *a, **k): pass
out = []
try:
    img, status = L.generate_image("a blue butterfly on a green leaf, macro", "", "1:1", 10, 3.5, 11, progress=P())
    out.append("IMG: " + str(img) + " | " + status)
    up, ustatus = L.upscale_image_ui(img, progress=P())
    out.append("UPSCALE: " + str(up) + " | " + ustatus)
    if up and os.path.exists(up):
        out.append("ORIG %d -> UPSCALED %d bytes" % (os.path.getsize(img), os.path.getsize(up)))
    else:
        out.append("UPSCALED FILE MISSING")
except Exception as e:
    out.append("FAIL: " + repr(e)[:400])
    out.append(traceback.format_exc()[-800:])
open("/teamspace/studios/this_studio/upscale_verify.txt", "w").write("\n".join(out))
'''
sdk(lambda: s.run("cat > /teamspace/studios/this_studio/verify_upscale.py <<'PYEOF'\n" + verify + "\nPYEOF"))
try:
    sdk(lambda: s.run_and_detach("cd /teamspace/studios/this_studio && python verify_upscale.py"))
except Exception as e:
    print("verify run_and_detach err:", e)

for i in range(60):
    try:
        out = sdk(lambda: s.run("cat /teamspace/studios/this_studio/upscale_verify.txt 2>/dev/null"))
    except Exception as e:
        out = "poll err " + str(e)[:80]
    if out and ("ORIG" in out or "MISSING" in out or "FAIL" in out):
        print("==== UPSCALE VERIFY (fresh process, patched upscaler) ====")
        print(out)
        break
    time.sleep(8)
else:
    print("== upscale verify not finished; last ==")
    print(out)

# ---- PART 2: restart the live app so the patched upscaler is served to users ----
print("\n== restarting live app (kill old app + tunnel, relaunch) ==")
try:
    sdk(lambda: s.run_and_detach(
        "pkill -f launch_app.py; pkill -f cloudflared; sleep 4; "
        "cd /teamspace/studios/this_studio && rm -f lab.log && "
        "setsid python launch_app.py > lab.log 2>&1 < /dev/null &"))
except Exception as e:
    print("restart run_and_detach err:", e)

# poll lab.log for the new quick-tunnel URL
new_url = None
for i in range(70):
    try:
        log = sdk(lambda: s.run("cat /teamspace/studios/this_studio/lab.log 2>/dev/null"))
    except Exception as e:
        log = ""
    m = pat.search(log or "")
    if m:
        new_url = m.group(0)
        break
    time.sleep(6)
print("==== NEW LAB URL ====")
print(new_url if new_url else "(URL not found in lab.log yet)")
