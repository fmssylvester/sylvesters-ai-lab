#!/usr/bin/env python3
"""gen_reel.py — rebuild the self-contained embedded footage reel.

Samples N frames evenly across the 480-frame screenmouse sequence, downscales
them, base64-encodes, and writes assets/footage/embedded/footageReel.ts so the
footage renders in Remotion Studio without dev-server asset resolution.
"""
import base64
import subprocess
import os

SRC = "assets/footage/screenmouse/f-{:03d}.jpg"
OUT = "assets/footage/embedded/footageReel.ts"
N = 40
TOTAL = 480


def main():
    indices = [1 + round(i * (TOTAL - 1) / (N - 1)) for i in range(N)]
    frames = []
    for idx in indices:
        src = SRC.format(idx)
        tmp = "/data/data/com.termux/files/usr/tmp/opencode/reel_%03d.jpg" % idx
        subprocess.run(
            ["magick", src, "-resize", "960x540", "-quality", "72", tmp],
            check=True,
        )
        with open(tmp, "rb") as f:
            frames.append(base64.b64encode(f.read()).decode("ascii"))
        os.remove(tmp)
    with open(OUT, "w") as f:
        f.write("// AUTO-GENERATED embedded footage reel (%d frames, sampled from 480).\n" % N)
        f.write("// Self-contained so it renders in Remotion Studio without dev-server asset resolution.\n")
        f.write("// Full render can swap to the on-disk 480-frame sequence via staticFile.\n")
        f.write("export const EMBEDDED_FRAMES: string[] = [\n")
        for fr in frames:
            f.write('  "data:image/jpeg;base64,%s",\n' % fr)
        f.write("];\n")
        f.write("export const EMBEDDED_COUNT = %d;\n" % len(frames))
    kb = os.path.getsize(OUT) // 1024
    print("wrote %s (%d frames, %d KB)" % (OUT, len(frames), kb))


if __name__ == "__main__":
    main()
