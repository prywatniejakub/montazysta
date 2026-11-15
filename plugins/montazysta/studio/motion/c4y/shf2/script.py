r"""Próbka Clips4you dla Shift nr 2 (2026-10-05): ICH film z Instagrama (prowadząca, 1:45) skrócony do ~30 s JEJ głosem.
Pokaz usługi „montaż z Waszych nagrań”: cięcia na najmocniejsze zdania, przebitki POV, napisy max 3 słowa, licznik kasynowy.
Źródło: ../shift/src/ig/DdRUEodIY_-.mp4 (1080x1920, wypalone napisy po 1 słowie na dole -> kadr z zoomem od góry je wycina),
przebitki: ten sam film (POV malowanie) + ../shift/src/shift-ugc-operators.mp4 (POV silnik).
  ..\..\..\runtime\python.exe script.py build   (dźwięk jej głosu, timing, klatki)   potem   stills   potem   audio render
"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "schrony"))
import c4ykit

NAME = "shf2"
SRC = os.path.join(HERE, "..", "shift", "src")
IG = os.path.join(SRC, "ig", "DdRUEodIY_-.mp4")
UGC = os.path.join(SRC, "shift-ugc-operators.mp4")
SCRIBE = IG + ".scribe.json"
GAP = .1
# fragmenty jej wypowiedzi (czasy w pliku IG); obraz: None = ten sam moment (synchronicznie), albo lista przebitek
# przebitka = (od_ile_s_w_fragmencie, plik, start_w_pliku)
SEGS = [
    ("s1", 0.22, 3.44, None),                       # Słyszałeś taką bajkę, że pieniądze nie leżą na ziemi?
    ("s2", 3.90, 4.36, None),                       # Leżą.
    ("s3", 4.36, 6.48, None),                       # Tylko nie wiem, dlaczego się po nie nie schylasz.
    ("s4", 14.58, 17.50, None),                     # Jeśli jesteś mechanikiem, elektrykiem,
    ("s5", 18.88, 19.72, None),                     # hydraulikiem
    ("s6", 31.86, 34.38, None),                     # Wystarczy, że założysz opaskę na głowę, (u nich: facet z opaską wierci)
    ("s7", 36.40, 38.30, [(0, IG, 54.1)]),          # i zaczniesz nagrywać swoje dłonie  -> POV malowanie z bliska
    ("s8", 69.58, 76.14, [(3.4, IG, 48.0), (5.4, UGC, 8.0)]),  # Za każdą ... od 37 do nawet 50 złotych -> POV malowanie + POV ściana, licznik
    ("s9", 76.14, 77.96, [(0, UGC, 6.0)]),          # Jeśli będziesz nagrywał osiem godzin,  -> POV silnik
    ("s10", 78.28, 80.86, [(0, "TRI", 0)]),         # możesz mieć dodatkowe cztery stówki za dniówkę. -> 3 pasy POV (kuchnia, warsztat, sklep) + licznik 400
    ("s11", 94.58, 97.36, None),                    # Wejdź na stronę joinshift.pl,
    ("s12", 97.88, 100.34, None),                   # zamów swoją opaskę i działaj.
]
HOLD = .9


def run(args): subprocess.run([c4ykit.FF, "-y", "-loglevel", "error"] + args, check=True)


def build():
    # 1) jej dźwięk w dobrej jakości
    run(["-i", IG, "-vn", "-ac", "2", "-ar", "48000", os.path.join(HERE, "her.wav")])
    words = [w for w in json.load(open(SCRIBE, encoding="utf-8"))["words"] if w.get("type") == "word"]
    # 2) timing.json w formacie longkit (linia = fragment, plik her.wav, src = czasy w pliku)
    t, lines, pieces = 0.0, [], []
    for i, (k, a, b, broll) in enumerate(SEGS):
        if i: t += GAP
        s = round(t, 3)
        ws = [{"w": w["text"], "t": round(s + w["start"] - a, 3), "e": round(s + w["end"] - a, 3)} for w in words if a - .02 <= w["start"] < b - .02]
        lines.append({"key": k, "ch": "her", "text": " ".join(w["w"] for w in ws), "slot": s, "src": [a, b], "file": "her.wav", "words": ws})
        cuts = [(0, None, None)] + list(broll or [])  # (od, plik, start)
        if broll and broll[0][0] == 0: cuts = list(broll)
        for j, (off, f, fs) in enumerate(cuts):
            end = (cuts[j + 1][0] if j + 1 < len(cuts) else b - a)
            if i == len(SEGS) - 1 and j == len(cuts) - 1: end += HOLD
            pieces.append({"name": f"s2_{k}_{j}", "a": round(s + off, 3), "b": round(s + end + (GAP if i + 1 < len(SEGS) and j == len(cuts) - 1 else 0), 3),
                           "file": f or IG, "fs": fs if f else a + off, "len": end - off + GAP + .1, "sync": f is None})
        t = s + (b - a)
    T = {"DUR": round(t + HOLD, 2), "DROP": -10, "BRK": None, "REDROP": None, "END": -10, "BAR": 2.0, "BEAT": .5, "H0": 0, "GRID0": 0, "ACC": [],
         "beats": [], "segments": [], "lines": lines, "chapters": [{"id": "her", "title": "Ona", "a": 0, "z": round(t, 3), "ph": False}]}
    json.dump(T, open(os.path.join(HERE, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(HERE, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    # 3) klatki obrazu (1080x1920, 30 kl./s)
    clips = os.path.join(HERE, "..", "clips"); man = {}
    for p in pieces:
        if p["file"] == "TRI": continue  # 3 pasy POV z klatek shf1 (sfTom, sfSand, sfCandy)
        d = os.path.join(clips, p["name"]); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        run(["-ss", f"{p['fs']:.3f}", "-t", f"{p['len']:.3f}", "-i", p["file"], "-an", "-vf",
             "fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", "-q:v", "4", os.path.join(d, "%03d.jpg")])
        man[p["name"]] = len(os.listdir(d))
    import pano
    pano.manifest_update(man)
    open(os.path.join(HERE, "pieces.js"), "w", encoding="utf-8").write("window.PIECES = " + json.dumps(pieces) + ";\n")
    for l in lines: print(f"{l['slot']:6.2f}  {l['text']}")
    print("DUR", T["DUR"], "| kawałków obrazu:", len(pieces))


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "build" in steps: build()
    if "stills" in steps: c4ykit.stills(HERE, NAME, [0, 1, 2.5, 3.6, 5, 6.5, 8, 9.5, 11, 12.5, 14, 15.5, 17, 18.5, 20, 21.5, 23, 24.5, 26, 27.5, 29])
    if "audio" in steps: c4ykit.audio(HERE, NAME, "shift_work_beat.mp3", bed=-22.0)
    if "render" in steps: c4ykit.render(HERE, NAME, workers=4)
