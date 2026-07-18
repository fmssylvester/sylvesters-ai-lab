import modal, os

app = modal.App("checkvol")
VOL = modal.Volume.from_name("ltx23-models")


@app.function(volumes={"/comfy/models": VOL})
def check():
    d = "/comfy/models/text_encoders/gemma-3-12b-it-qat-q4_0-unquantized"
    total = 0
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        if os.path.isfile(p):
            s = os.path.getsize(p)
            total += s
            print(f, s)
    print("TOTAL GEMMA BYTES:", total, "=", round(total / 1e9, 2), "GB")
    # also check checkpoint + unet + lora
    for sub in ("checkpoints", "unet", "loras"):
        sd = os.path.join("/comfy/models", sub)
        if os.path.isdir(sd):
            for f in os.listdir(sd):
                p = os.path.join(sd, f)
                if os.path.isfile(p):
                    print(sub + "/" + f, os.path.getsize(p))


@app.function(volumes={"/comfy/models": VOL})
def bootlog():
    import os
    p = "/comfy/models/comfy_boot.log"
    if not os.path.exists(p):
        print("NO BOOT LOG")
        return
    txt = open(p).read()
    print("===== comfy_boot.log (last 5000 chars) =====")
    print(txt[-5000:])


@app.local_entrypoint()
def main():
    check.remote()
    bootlog.remote()
