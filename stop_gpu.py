import os, sys, json, time
STABLE = "/data/data/com.termux/files/home/ai-lab-internal"
sys.path.insert(0, STABLE)
import sdk_patch
from lightning_sdk import Studio
from lightning_sdk.lightning_cloud.rest_client import LightningClient
from lightning_sdk.studio import _resolve_teamspace

ACC = json.load(open(STABLE + "/accounts.json"))
A = next(a for a in ACC["accounts"] if a["name"] == "acct_ugurujuliet7")
CLOUD = A.get("cloud") or ACC.get("cloud", "lightning-public-prod")
os.environ["LIGHTNING_API_KEY"] = A["api_key"]
os.environ["LIGHTNING_USER_ID"] = A["user"]

STUDIO_NAME = "teammate-2-deploy-model-aws"

def sdk(fn, n=10):
    last = None
    for _ in range(n):
        try:
            return fn()
        except Exception as e:
            last = e
            time.sleep(4)
    raise last

def list_running():
    c = LightningClient()
    ts = _resolve_teamspace(teamspace=A["teamspace"], org=None, user=A["user"])
    r = c.cloud_space_service_list_cloud_space_instances(project_id=ts.id)
    out = []
    for i in (getattr(r, "cloudspace_instances", None) or []):
        csid = getattr(i, "cloud_space_id", None)
        cc = getattr(i, "compute_config", None) or {}
        out.append((csid,
                    getattr(i, "cloud_space_instance_id", None),
                    getattr(cc, "name", None),
                    getattr(i, "public_ip_address", None)))
    return out, ts, c

runs, ts, client = sdk(list_running)
if not runs:
    print("Lab studio is already STOPPED (no running instance).")
else:
    for (csid, inst_id, m, ip) in runs:
        if m != STUDIO_NAME:
            continue
        print(f"Stopping {m} (instance {inst_id}, ip {ip}) ...")
        sdk(lambda: client.cloud_space_service_stop_cloud_space_instance(ts.id, inst_id))
    for _ in range(30):
        time.sleep(8)
        runs2, _, _ = sdk(list_running)
        if not [r for r in runs2 if r[2] == STUDIO_NAME]:
            print("Lab studio PAUSED/STOPPED. GPU released.")
            break
    else:
        print("Stop issued; studio may still be shutting down.")
