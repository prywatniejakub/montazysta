"""tile stills into one sheet:  tile.py <folder> <out.jpg> [cols] [width]"""
import os, subprocess, sys
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
w = int(sys.argv[4]) if len(sys.argv) > 4 else 640
FF = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "ffmpeg", "ffmpeg.exe")
fs = sorted(f for f in os.listdir(d) if f.endswith(".png"))
rows = (len(fs) + cols - 1) // cols
lst = os.path.join(d, "_l.txt")
open(lst, "w").write("".join(f"file '{os.path.abspath(os.path.join(d, f)).replace(os.sep, '/')}'\n" for f in fs))
subprocess.run([FF, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-vf",
                f"scale={w}:-1,drawtext=text='%{{metadata\\:lavf.image2dec.source_basename\\:NA}}':x=8:y=8:fontsize=18:fontcolor=red,tile={cols}x{rows}:padding=6:color=white",
                "-frames:v", "1", out], check=False)
if not os.path.exists(out):
    subprocess.run([FF, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-vf",
                    f"scale={w}:-1,tile={cols}x{rows}:padding=6:color=white", "-frames:v", "1", out], check=True)
print(out, len(fs))
