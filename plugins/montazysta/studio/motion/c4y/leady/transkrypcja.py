r"""Transkrypcja z czasami słów (ElevenLabs scribe) -> <plik>.scribe.json + czytelny <plik>.txt (zdania z czasami).
  ..\..\..\runtime\python.exe transkrypcja.py <film.mp4> [...]
"""
import os, sys, json, subprocess
sys.path[:0] = [((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/app/vendor"), ((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/app")]
import dubbing as D
sys.stdout.reconfigure(encoding="utf-8")
FF = ((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/ffmpeg/ffmpeg.exe")
el = D.ElevenLabs(D.secrets().get("elevenlabs_api_key"))
for f in sys.argv[1:]:
    out = f + ".scribe.json"
    if not os.path.exists(out):
        mp3 = f + ".mp3"
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", f, "-vn", "-ac", "1", "-ar", "22050", "-b:a", "64k", mp3], check=True)
        json.dump(el.speech_to_text(mp3), open(out, "w", encoding="utf-8"), ensure_ascii=False)
    d = json.load(open(out, encoding="utf-8"))
    lines, cur = [], []
    for w in d.get("words", []):
        if w.get("type") != "word": continue
        cur.append(w)
        if w["text"].rstrip().endswith((".", "!", "?")) or len(cur) > 14:
            lines.append(f'{cur[0]["start"]:6.2f}-{cur[-1]["end"]:6.2f}  ' + " ".join(x["text"] for x in cur)); cur = []
    if cur: lines.append(f'{cur[0]["start"]:6.2f}-{cur[-1]["end"]:6.2f}  ' + " ".join(x["text"] for x in cur))
    open(f + ".txt", "w", encoding="utf-8").write("\n".join(lines))
    print("==", os.path.basename(f)); print("\n".join(lines))
