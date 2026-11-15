r"""Wspólny silnik rolek Żółtego Szalika (pakiet start8, 2026-10-19): zs2, zs3, zs4.
Głos: darmowy Edge TTS (domyślnie) albo ElevenLabs (TYLKO po zgodzie użytkownika: ZGODA=<kwota> ELEVEN=1).
Każda linia lektora = osobny plik vo/reel/<klucz>.mp3, lines.json w formacie {"lines": [...]} (longkit czyta pole file).
  ..\..\..\runtime\python.exe script.py voice timing stills audio render
"""
import json, os, re, subprocess, sys
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib")
sys.path.insert(0, LIB)
import c4ykit  # noqa: E402

EDGE = os.path.join(c4ykit.C4Y, "lib", "edgetts", "gen.mjs")
ZOFIA, MAREK = "pl-PL-ZofiaNeural", "pl-PL-MarekNeural"
MAGDALENA, ADAM = "N0GCuK2B0qwWozQNTS8F", None  # ElevenLabs: Magdalena = głos 1. rolki Emila; Adam = domyślny voicekit


def _norm(w):
    return re.sub(r"[^\wąćęłńóśźż]", "", w.lower())


def tighten(d, k, ws, maxgap=.3, keep=.24):
    """Edge robi długie pauzy po kropce: każdą przerwę między słowami > maxgap skracam do keep (cięcie w środku ciszy)"""
    src = os.path.join(d, k + ".mp3")
    segs, a = [], max(0.0, ws[0]["s"] - .06)
    for w, nx in zip(ws, ws[1:]):
        g = nx["s"] - w["e"]
        if g > maxgap:
            segs.append((a, w["e"] + keep / 2)); a = nx["s"] - keep / 2
    segs.append((a, ws[-1]["e"] + .25))
    out, t, cut = [], 0.0, []
    for (x, y) in segs: cut.append((x, y, t - x)); t += y - x
    nw = []
    for w in ws:
        sh = next(o for (x, y, o) in cut if x - 1e-6 <= w["s"] <= y + 1e-6)
        nw.append({"w": w["w"], "s": round(w["s"] + sh, 3), "e": round(w["e"] + sh, 3)})
    fc = "".join(f"[0:a]atrim={x:.3f}:{y:.3f},asetpts=PTS-STARTPTS[s{i}];" for i, (x, y) in enumerate(segs))
    fc += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[o]"
    c4ykit.run(["-i", src, "-filter_complex", fc, "-map", "[o]", "-ar", "44100", os.path.join(d, k + "_t.wav")])
    return nw, k + "_t.wav"


def voice_edge(here, lines, voice=ZOFIA, rate="+4%"):
    d = os.path.join(here, "vo", "reel"); os.makedirs(d, exist_ok=True)
    src = os.path.join(d, "_lines_in.json")
    json.dump([[k, t] for k, t in lines], open(src, "w", encoding="utf-8"), ensure_ascii=False)
    subprocess.run([sys.executable, os.path.join(c4ykit.C4Y, "lib", "edgetts", "gen.py"), d, voice, rate, src], check=True)
    out = []
    for k, text in lines:
        j = json.load(open(os.path.join(d, k + ".json"), encoding="utf-8"))
        ws, toks = j["words"], text.split()
        if [_norm(w["w"]) for w in ws] == [_norm(t) for t in toks]:  # przywróć interpunkcję z tekstu (Edge jej nie zwraca)
            ws = [{"w": t, "s": w["s"], "e": w["e"]} for w, t in zip(ws, toks)]
        else:
            print("  !! słowa Edge != tekst w", k, [w["w"] for w in ws])
        ws, f = tighten(d, k, ws)
        out.append({"text": text, "start": ws[0]["s"], "end": ws[-1]["e"], "words": ws, "file": f})
    json.dump({"lines": out, "engine": "edge:" + voice}, open(os.path.join(d, "lines.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for l in out: print(f"  {l['end'] - l['start']:5.2f}s  {l['text']}")


def voice_eleven(here, lines, voice_id):
    d = os.path.join(here, "vo", "reel"); os.makedirs(d, exist_ok=True)
    c4ykit.kit.tighten(d, [t for _, t in lines], **({"voice_id": voice_id} if voice_id else {}))


def stock(items):
    """klipy Pexels -> clips/<nazwa>/NNN.jpg (1080x1920, 30 kl./s); items = [(nazwa, id, start_s, sekundy)]"""
    man = {}
    for nm, pid, ss, dur in items:
        d = os.path.join(c4ykit.CLIPS, nm); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        c4ykit.run(["-ss", f"{ss}", "-t", f"{dur}", "-i", os.path.join(c4ykit.C4Y, "zsz", "stock", f"{pid}.mp4"), "-an", "-vf", "fps=30",
                    "-q:v", "3", os.path.join(d, "%03d.jpg")])
        man[nm] = len(os.listdir(d)); print("klip", nm, man[nm], "klatek")
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    m = json.load(open(man_p, encoding="utf-8")); m.update(man)
    json.dump(m, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(m) + ";\n")


def main(here, name, lines, gaps, music, bed=-21.0, edge_voice=ZOFIA, eleven_voice=MAGDALENA, hold=2.2, rate="+4%", clips=()):
    steps = sys.argv[1:]
    if "clips" in steps: stock(clips)
    if "voice" in steps:
        if os.environ.get("ELEVEN") == "1":
            voice_eleven(here, lines, eleven_voice)
        else:
            voice_edge(here, lines, edge_voice, rate)
    if "timing" in steps: c4ykit.timing(here, lines, gaps, hold=hold)
    if "stills" in steps:
        D = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))["DUR"]
        c4ykit.stills(here, name, [round(x * .5, 2) for x in range(int(D / .5) + 1)])
    if "audio" in steps: c4ykit.audio(here, name, music, bed=bed)
    if "render" in steps: c4ykit.render(here, name, workers=5)
