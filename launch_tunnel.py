"""Launch the drops site tunnel detached from the controlling terminal.

cloudflared is a long-lived Go daemon that keeps the shell's pipe open, which
makes interactive launchers hang. Spawning it via subprocess with
start_new_session=True and all fds redirected detaches it cleanly.
"""
import subprocess
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def launch():
    log = open(os.path.join(HERE, "cloudflared_drops.log"), "ab", buffering=0)
    p = subprocess.Popen(
        [os.path.join(HERE, "cloudflared"), "tunnel", "--url", "http://127.0.0.1:8787"],
        stdin=subprocess.DEVNULL,
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
        cwd=HERE,
    )
    print(f"cloudflared pid={p.pid}")


if __name__ == "__main__":
    launch()
