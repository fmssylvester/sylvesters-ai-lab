"""Launch the drops site tunnel via `bore` (Rust, uses system DNS resolver).

Unlike cloudflared (pure-Go, broken DNS on Termux), bore's Rust std resolver uses
getaddrinfo which works on Android. Detached via start_new_session so the tool
command returns immediately.
"""
import subprocess
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def launch():
    log = open(os.path.join(HERE, "bore.log"), "ab", buffering=0)
    p = subprocess.Popen(
        [os.path.join(HERE, "bore"), "local", "8787", "--to", "bore.pub"],
        stdin=subprocess.DEVNULL,
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
        cwd=HERE,
    )
    print(f"bore pid={p.pid}")


if __name__ == "__main__":
    launch()
