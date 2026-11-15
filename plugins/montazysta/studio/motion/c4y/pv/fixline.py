r"""Poprawka JEDNEJ linii lektora (ElevenLabs, głos marki P2) bez nagrywania całej rolki (zasada: wiedza/feedback-rolki-recenzja-przed-renderem.md).
Nagrywa linię nr N (od 0) osobno do vo/fix_N/, tnie pauzy (kit.tighten) i przepina ją w vo/reel/lines.json; potem: script.py timing stills audio render.
  ZGODA=0.02 ..\..\..\runtime\python.exe ..\pv\fixline.py <folder rolki> <N> [eleven_v3|eleven_multilingual_v2]
"""
import json, os, shutil, sys
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(ROOT, "motion", "kuba"), os.path.join(ROOT, "motion", "lib")]
import voicekit  # noqa: E402
import kit  # noqa: E402

here, n = os.path.abspath(sys.argv[1]), int(sys.argv[2])
model = sys.argv[3] if len(sys.argv) > 3 else voicekit.MODEL
reel = os.path.join(here, "vo", "reel")
lp = os.path.join(reel, "lines.json")
j = json.load(open(lp, encoding="utf-8"))
lines = j["lines"] if isinstance(j, dict) else [{**l, "file": "voice_t.mp3" if l.get("tight") else "voice.mp3"} for l in j]
text = lines[n]["text"]
fx = os.path.join(here, "vo", f"fix_{n}")
shutil.rmtree(fx, ignore_errors=True); os.makedirs(fx)
if model != voicekit.MODEL:
    _gen = voicekit.generate  # kit.voice woła voicekit.generate bez modelu: podmieniam domyślny model
    voicekit.generate = lambda h, ls, voice=voicekit.VOICE, model=model, seps=None: _gen(h, ls, voice=voice, model=model, seps=seps)
kit.tighten(fx, [text])
new = json.load(open(os.path.join(fx, "lines.json"), encoding="utf-8"))[0]
lines[n] = {**new, "text": text, "file": f"../fix_{n}/voice_t.mp3" if new.get("tight") else f"../fix_{n}/voice.mp3"}
json.dump({"lines": lines}, open(lp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"linia {n} podmieniona ({model}): {lines[n]['end'] - lines[n]['start']:.2f} s  {text}")
