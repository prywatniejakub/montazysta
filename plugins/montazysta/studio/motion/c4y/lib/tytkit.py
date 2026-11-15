r"""Rolki pokazowe Clips4you z PRAWDZIWYCH nagrań klienta (Tytus, treningi gimnastyczne, 2026-10-15).
Źródło: nagrania z telefonu 4K 60 kl./s (pion po obrocie, 2160x3840), lektor ElevenLabs (Adam), napisy prem.js.
Ujęcie = (klip, sekunda w źródle, prędkość, zoom, środek x, środek y); prędkość < 1 = slow motion z 60 kl./s.
Cięcia: każda linia lektora dzieli się równo na swoje ujęcia; ostatnia linia = plansza końcowa na tle END.
  ..\..\..\runtime\python.exe script.py voice timing build stills audio render
"""
import os, sys, json, subprocess
HERE_LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_LIB)
import c4ykit  # noqa: E402

SURO = os.environ.get("TYT_SURO", r"C:\Users\komputer\AppData\Local\Temp\claude\C--Users-komputer-Desktop-Youtube\e87c5bb4-ce5e-4c3b-bb3e-52929b942406\scratchpad\tytus\surowe")
W0, H0 = 2160, 3840
FP = os.path.join(c4ykit.ROOT, "ffmpeg", "ffprobe.exe")
_DUR = {}


def clip_dur(clip):
    if clip not in _DUR:
        r = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(SURO, f"IMG_{clip}.MOV")],
                           capture_output=True, text=True)
        _DUR[clip] = float(r.stdout.strip())
    return _DUR[clip]


def frames(nm, spec, ln):
    clip, src, speed, z, cx, cy = spec
    dur = clip_dur(clip) - .05
    need = ln * speed
    if src + need > dur:
        src = max(0.0, dur - need)
        if need > dur:
            speed, need = dur / ln, dur
    cw, ch = int(W0 / z) // 2 * 2, int(H0 / z) // 2 * 2
    x = max(0, min(W0 - cw, int(cx * W0 - cw / 2))); y = max(0, min(H0 - ch, int(cy * H0 - ch / 2)))
    d = os.path.join(c4ykit.CLIPS, nm); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    c4ykit.run(["-ss", f"{src:.3f}", "-t", f"{need + .12:.3f}", "-i", os.path.join(SURO, f"IMG_{clip}.MOV"), "-an", "-vf",
                f"fps={30 / speed:.4f},crop={cw}:{ch}:{x}:{y},scale=1080:1920:flags=lanczos", "-q:v", "3", os.path.join(d, "%03d.jpg")])
    return len(os.listdir(d))


def build(here, name, lines, shots, end, only_pieces=False):
    T = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))
    L = {l["key"]: l for l in T["lines"]}
    keys = [k for k, _ in lines]
    tEnd = round(L[keys[-1]]["slot"] - .05, 3)
    pieces = []
    for i, k in enumerate(keys[:-1]):
        a = 0.0 if i == 0 else L[k]["slot"] - .04
        z = (L[keys[i + 1]]["slot"] - .04) if i + 2 < len(keys) else tEnd
        sh = shots[k]; seg = (z - a) / len(sh)
        for j, s in enumerate(sh):
            pieces.append({"name": f"{name}_{k}_{j}", "a": round(a + j * seg, 3), "b": round(a + (j + 1) * seg, 3), "slow": s[2] < 1, "spec": s})
    for n, p in enumerate(pieces):
        p["wh"] = n > 0 and n % 2 == 1  # co drugie cięcie: przejście z przesunięciem i rozmyciem, reszta: twarde cięcie z najazdem
        p["dir"] = 1 if n % 4 == 1 else -1
    endp = {"name": f"{name}_end", "a": tEnd, "b": T["DUR"] + .5, "spec": end}
    open(os.path.join(here, "pieces.js"), "w", encoding="utf-8").write(
        "window.PIECES = " + json.dumps([{k: v for k, v in p.items() if k != "spec"} for p in pieces]) + ";\nwindow.ENDP = " +
        json.dumps({"name": endp["name"], "a": tEnd}) + ";\n")
    for p in pieces: print(f"{p['a']:6.2f}-{p['b']:6.2f}  {p['name']}  {p['spec']}")
    print("plansza od", tEnd, "DUR", T["DUR"])
    if only_pieces: return
    man = {p["name"]: frames(p["name"], p["spec"], p["b"] - p["a"] + .1) for p in pieces + [endp]}
    sys.path.insert(0, os.path.join(c4ykit.C4Y, "schrony"))
    import pano
    pano.manifest_update(man)
    print("klatki:", man)


def main(here, name, lines, gaps, shots, end, music, bed=-20.0):
    steps = sys.argv[1:]
    if "voice" in steps:
        os.makedirs(os.path.join(here, "vo", "reel"), exist_ok=True)
        c4ykit.kit.tighten(os.path.join(here, "vo", "reel"), [t for _, t in lines])
    if "timing" in steps: c4ykit.timing(here, lines, gaps, hold=1.9)
    if "pieces" in steps: build(here, name, lines, shots, end, only_pieces=True)
    if "build" in steps: build(here, name, lines, shots, end)
    if "stills" in steps:
        D = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))["DUR"]
        c4ykit.stills(here, name, [round(x * .5, 2) for x in range(int(D / .5) + 1)])
    if "audio" in steps: c4ykit.audio(here, name, music, bed=bed)
    if "render" in steps: c4ykit.render(here, name, workers=4)
