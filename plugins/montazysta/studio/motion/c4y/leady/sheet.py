r"""Podgląd materiałów leada: dla każdego filmu w <folder> czas trwania + pasek klatek (co N s) -> <folder>\_sheets\<plik>.jpg
  ..\..\..\runtime\python.exe sheet.py <folder> [co_ile_s] [kolumny]
"""
import os, sys, re, subprocess
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")


def dur(f):
    r = subprocess.run([FF, "-i", f], capture_output=True, text=True, errors="replace")
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    s = re.search(r"Stream.*Video.* (\d{2,5})x(\d{2,5})", r.stderr)
    return (int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else 0), (s.group(1) + "x" + s.group(2) if s else "?")


def main(folder, step=2.0, cols=8):
    out = os.path.join(folder, "_sheets"); os.makedirs(out, exist_ok=True)
    for f in sorted(os.listdir(folder)):
        p = os.path.join(folder, f)
        if not f.lower().endswith((".mp4", ".webm", ".mkv", ".mov")): continue
        d, res = dur(p)
        n = max(1, int(d / step))
        rows = (n + cols - 1) // cols
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", p, "-vf",
                        f"fps=1/{step},scale=240:-2,drawtext=text='%{{pts\\:hms}}':x=4:y=4:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6,tile={cols}x{rows}",
                        "-frames:v", "1", "-q:v", "4", os.path.join(out, f + ".jpg")], capture_output=True)
        print(f"{f}  {d:.1f}s  {res}")


if __name__ == "__main__":
    main(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 2.0, int(sys.argv[3]) if len(sys.argv) > 3 else 8)
