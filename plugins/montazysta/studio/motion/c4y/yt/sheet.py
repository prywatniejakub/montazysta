import sys, os, glob, subprocess
FF = ((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/ffmpeg/ffmpeg.exe")
d, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(d, "s*.png")))
if len(sys.argv) > 3: files = [f for f in files if sys.argv[3] <= os.path.basename(f)[1:7] <= sys.argv[4]]
cols = 3; rows = (len(files) + cols - 1) // cols
lst = out + ".txt"
open(lst, "w").write("".join(f"file '{os.path.abspath(f)}'\nduration 1\n" for f in files))
subprocess.run([FF, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-vf", f"scale=640:360,tile={cols}x{rows}:padding=4:color=white", "-frames:v", "1", "-q:v", "3", out], check=True)
os.remove(lst); print(out, [os.path.basename(f)[1:7] for f in files])
