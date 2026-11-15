r"""4 rolki KOLMED (partia 2, 2026-11-01) z ICH filmów z YouTube: „Zabiegi okulistyczne w KOLMED” (qzfYYDi2CCs, 4K, lek. Agata Bełżecka + anestezjolog)
i „Zabiegi ginekologiczne w KOLMED” (EtWPfOaJlcM, 4K, dr n. med. Wojciech Pięta). Pozostałe filmy kanału (neurolog, prezentacje) są niedostępne, dermatolog nie pracuje.
Silnik i szablon jak w ../kolmed-zabiegi (build.py, szablon.html). Źródła poziome z wypalonymi napisami na dole: kadr 9:16 z górnych 81% wysokości.
Kolejność (prośba użytkownika): build + stills + audio + kontrola słów (glos.py na audio.wav) i recenzja PRZED renderem, render raz.
  ..\..\..\runtime\python.exe build.py kz5 kz6 kz7 kz8 build stills audio      potem      ... render
"""
import os, re, sys, json, shutil, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(C4Y))
sys.path.insert(0, os.path.join(C4Y, "lib")); sys.path.insert(0, os.path.join(C4Y, "schrony"))
sys.path.append(os.path.join(ROOT, "tools", "transkrypcja", "pylib"))  # numpy
import numpy as np
import c4ykit

PLIKI = {"oku": os.path.join(C4Y, "kolmed", "src", "oku_4k.mkv"), "gin": os.path.join(HERE, "src", "gin_4k.mkv")}
_S = json.load(open(os.path.join(HERE, "work", "slowa.json"), encoding="utf-8"))
SL = {k: sorted(w for n, v in _S.items() if n.startswith(k) for w in v) for k in ("oku", "gin")}
GAP, PAD, HOLD = .12, .4, 3.2

# Segment: (klucz, klip, czas 1. słowa, czas ostatniego słowa, tekst napisów (tyle słów, ile rozpoznał whisper; "_" = spacja w jednym słowie), ujęcia)
# Ujęcie: (od ile s w segmencie, "S", zoom, góra kadru 0-1) = lekarz mówi synchronicznie; (od, "B", klip, czas w klipie, zoom, środek x, góra kadru) = przebitka bez dźwięku.
BEL = ("lek. Agata Bełżecka", "okulista · KOLMED")  # kolmed.pl/zespol-lekarski
PIE = ("dr n. med. Wojciech Pięta", "ginekolog endokrynolog · KOLMED")  # sprawdzone 2026-11-01
# Ujęcie: (od, "S", środek x, wysokość kadru, góra) = mówca synchronicznie; (od, "B", klip, czas, środek x, wysokość, góra) = przebitka.
# "~" w tekście = puste słowo (np. końcówka "-u", którą whisper dał osobno); "_" = spacja w jednym słowie.
ROLKI = {
    "kz5": dict(title="Zmiana na powiece", hook="Usuwanie gradówek<br>i <span>kępek żółtych</span>", end="Konsultacja okulistyczna", lt="s2", ltp=BEL, odo=None,
                hi=r"^(powiek|gradówek|żółtych|włókniaków|prosaków|brodawek|entropionu|ektropionu|zabiegową)", segs=[
        ("s1", "oku", 43.10, 47.86, "Zapraszamy pacjentów posiadających liczne zmiany na powierzchni gałki ocznej, jak i powiek.", [(0, "S", .70, .81, 0)]),
        # przebitka od 28,5 s (sala zabiegowa, aparatura); od 36,0 s była lekarka przy lampie z połową twarzy w kadrze (użytkownik 2026-11-04)
        ("s2", "oku", 50.92, 56.36, "Wykonujemy operację usunięcia gradówek, kępek żółtych, włókniaków, prosaków, brodawek,", [(0, "S", .70, .81, 0), (2.6, "B", "oku", 28.5, .5, .81, 0)]),  # sala zabiegowa i aparatura; na dokumencie (38 s) leżał bilet PKP
        ("s3", "oku", 57.36, 61.20, "operację podwinięcia i odwinięcia powieki, czyli entropionu i ektropionu.", [(0, "S", .70, .81, 0)]),
    ]),
    "kz6": dict(title="Dlaczego teraz tyle osób robi powieki", hook="Skąd moda<br>na <span>plastykę powiek?</span>", end="Plastyka powiek", lt="s2", ltp=BEL, odo=None,
                hi=r"^(powiek|popularne|COVID|maseczki|oczy|uwagę)", segs=[
        ("s2", "oku", 240.44, 244.26, "One były wykonywane od wieków, natomiast teraz stały się niesamowicie popularne.", [(0, "S", .72, .81, 0)]),
        ("s3", "oku", 245.38, 258.12, "Dzieje się tak za sprawą COVID-u ~ i za sprawą tego, że przez długi okres czasu nosiliśmy maseczki zasłaniające nam większą część twarzy, także oczy stały się jedynym miejscem, na którym skupialiśmy naszą uwagę, patrząc na rozmówcę.",
         [(0, "S", .73, .81, 0), (3.8, "B", "oku", 154.0, .4, .81, 0), (5.2, "S", .72, .81, 0)]),  # 2026-11-04: bez bliższego kadru (.62), twarz była za blisko
    ]),
    "kz7": dict(title="Znieczulenie i sala wybudzeń", hook="Jakie znieczulenie<br>przy <span>zabiegu?</span>", end="KOLMED Międzylesie", lt="", ltp=("", ""), odo=None,
                hi=r"^(anestezjolog|analgosedacji|dożylnego|godziny|domu)", segs=[
        ("s1", "oku", 142.26, 147.96, "Anestezjolog znieczula pacjenta pod postacią analgosedacji głębokiej lub płytkiego znieczulenia dożylnego, ~", [(0, "S", .35, .81, 0), (5.0, "B", "oku", 149.0, .56, .81, 0)]),
        ("s2", "oku", 173.62, 179.80, "pacjent w ciągu godziny po zabiegu właściwie może wyjść pod eskortą kogoś bliskiego do domu.",
         [(0, "B", "oku", 180.7, .5, .81, 0), (3.0, "B", "oku", 192.0, .5, .81, 0)]),
    # 2026-11-04: w filmie od 147,98 s efekt przejścia „kwadrat” (ujęcie mówcy kończymy przed nim, potem strzykawka 149,0-150,5 s); 180,0-180,6 s to twarz mówiącej bez synchronu, kroplówka od 180,7 s
    ]),
    "kz8": dict(title="Czym jest histeroskopia", hook="Czym jest<br><span>histeroskopia?</span>", end="Konsultacja ginekologiczna", lt="s1", ltp=PIE, odo=None,
                hi=r"^(jamy|macicy|polipów|zrostów|miejscowym|ogólnym)", segs=[
        ("s1", "gin", 55.58, 70.24, "histeroskopii, zabiegu polegającego na oglądaniu wnętrza jamy macicy oraz ewentualnie usuwaniu wszelkich zmian patologicznych, czyli polipów, zrostów, które wywołują wiele_dolegliwości u pacjentek.",
         [(0, "S", .76, .81, 0), (5.2, "B", "gin", 73.0, .55, .81, 0), (8.0, "S", .76, .81, 0)]),  # przebitka od 73 s: wcześniej lekarz odwrócony plecami
        # 98,7-101,3 s w ich filmie kamera stoi za plecami lekarza: najpierw logo KOLMED (105 s), mówiący lekarz od 101,7 s (twarz i profil)
        ("s2", "gin", 98.62, 103.58, "Możemy robić to w znieczuleniu miejscowym, bądź ~ także pełnym znieczuleniem ogólnym z anestezjologiem.",
         [(0, "B", "gin", 105.0, .6, .81, 0), (3.0, "S", .6, .81, 0)]),
    ]),
}


# ręczne granice głosu po kontroli glos.py i obwiedni (2026-11-01): całe "policzka", "HPV" (ha-pe-fau do 37,6 s), "nowotwór" (z pauzą w środku, do 50,2 s),
# bez doklejonych "jest", "-ki" i "które"; ogon miksu to +0,16 s, więc koniec stawiamy tak, żeby ogon nie łapał następnego słowa
# 2026-11-04 (obwiednia 20 ms + whisper medium): stare cięcia urywały „ektropionu” (w połowie), „rozmówcę” (bez „-cę”), łapały „co” po „dożylnego”
# i końcówkę „pacjentek”; filmy z YouTube mają podkład, więc koniec ostatniej wypowiedzi wygasa (END_FADE), a nie urywa się
OVR = {("kz5", "s3"): (None, 62.24), ("kz6", "s3"): (None, 258.89), ("kz7", "s1"): (142.21, 148.34), ("kz7", "s2"): (173.60, None),  # kz7 s2: bez końcówki „znieczulenie”; s1: głos od klatki 0 (było 0,25 s ciszy)
       ("kz8", "s1"): (None, 70.94), ("kz8", "s2"): (None, 104.80)}


END_FADE = .3  # ostatnia wypowiedź wygasa łagodnie 0,3 s do końca miksu (B + 0,16), zamiast urwać się w 0,06 s przed planszą (uwaga użytkownika 2026-11-04)


def wygas(last, dl):
    """wygaszenie końca ostatniej wypowiedzi w pliku vo (plik = [A - PAD, B + PAD]; miks tnie w PAD + (B - A) + 0,16)"""
    return f",afade=t=out:st={PAD + dl + .16 - END_FADE:.3f}:d={END_FADE}" if last else ""


def run(args): subprocess.run([c4ykit.FF, "-y", "-loglevel", "error"] + args, check=True)


def pcm(clip, a, b):
    r = subprocess.run([c4ykit.FF, "-v", "error", "-ss", f"{max(0, a):.3f}", "-t", f"{b - a:.3f}", "-i", PLIKI[clip], "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True)
    return np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768.0


def bounds(clip, t0, t1):
    """granice cięcia głosu w pauzach (cisza >= 0,12 s wg obwiedni), bo whisper przesuwa początek 1. słowa i wydłuża koniec ostatniego"""
    ws = SL[clip]
    i = min(range(len(ws)), key=lambda n: abs(ws[n][0] - t0)); j = min(range(len(ws)), key=lambda n: abs(ws[n][0] - t1))
    A = max(ws[i][0] - .25, (ws[i - 1][1] + ws[i][0]) / 2) if i else max(0, ws[i][0] - .15)
    B = min(ws[j][1] + .25, (ws[j][1] + ws[j + 1][0]) / 2) if j + 1 < len(ws) else ws[j][1] + .2
    x0 = max(0, ws[i][0] - .8); x = pcm(clip, x0, ws[j][1] + .8); fr = 320  # 20 ms
    rms = np.array([np.sqrt(np.mean(x[k:k + fr] ** 2)) for k in range(0, len(x) - fr, fr)])
    thr = max(.0035, np.percentile(rms, 10) * 3)
    runs, k = [], 0
    while k < len(rms):  # ciche odcinki (od, do) w sekundach klipu
        if rms[k] < thr:
            m = k
            while m < len(rms) and rms[m] < thr: m += 1
            if (m - k) * .02 >= .12: runs.append((x0 + k * .02, x0 + m * .02))
            k = m
        else: k += 1
    s0 = ws[i][0]; span = ws[i][1] - s0
    st = [r for r in runs if s0 - .6 <= r[0] <= s0 + .4 * span]
    if st: A = st[-1][1] - .06
    en = [r for r in runs if ws[j][0] + .15 <= r[0] <= ws[j][1] + .5]
    if en: B = en[0][0] + .12
    return round(A, 3), round(B, 3), ws[i:j + 1]


def mean_db(clip, a, b):
    r = subprocess.run([c4ykit.FF, "-hide_banner", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", PLIKI[clip], "-vn", "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return float(re.search(r"mean_volume:\s*(-?[\d.]+)", r.stderr).group(1))


# 2026-11-04 (użytkownik: „twarz trochę za blisko, dałoby się oddalić”): kadr o ZO szerszy niż 9:16; brakującą wysokość
# (dół filmu odpada przez wypalone napisy) wypełnia rozmyta, przyciemniona kopia ujęcia, brzegi przejścia wygładza maska 70 px
ZO, FH, FY = 1.18, 1626, 190  # szerokość kadru x1,18, wysokość obrazu po skalowaniu (1920/1,18), górna krawędź (więcej miejsca nad głową na hak)
MASK = os.path.join(HERE, "work", f"maska_1080x{FH}.png")


def maska():
    if not os.path.exists(MASK):
        run(["-f", "lavfi", "-i", f"color=c=white:s=1080x{FH}:d=1", "-frames:v", "1", "-vf", "format=gray,geq=lum='255*min(1,min(Y,H-1-Y)/70)'", MASK])


SRC_W, SRC_H = 3840, 2026  # oba filmy z YouTube (4K, pasy 1013:1920)
SLAD = {}  # nazwa ujęcia -> (wykrycie twarzy, min, max środka) do raportu


def frames(name, clip, fs, ln, cx, hf, top, sync=True):
    """mówca: kadr jedzie za twarzą (twarze.py, 2026-11-04: „ucieka twarz z kadru”), crop x co klatkę przez sendcmd;
    przebitka: stały kadr z konfiguracji (śledzenie łapało tam fałszywe twarze na sprzęcie i kadr skakał)"""
    import twarze
    d = os.path.join(c4ykit.CLIPS, name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    maska()
    ch = int(SRC_H * hf) // 2 * 2; cw = int(ch * 9 / 16) // 2 * 2; fw = int(ch * 9 / 16 * ZO) // 2 * 2
    if sync: path, det = twarze.sciezka(PLIKI[clip], fs, ln, hf, top, cx, fw / SRC_W)
    else: path, det = [cx] * int(round(ln * 30)), 0
    SLAD[name] = (det, min(path), max(path))
    px = lambda c, w: max(0, min(SRC_W - w, int(round(c * SRC_W - w / 2))))
    cmd = os.path.join(d, "_kadr.txt")
    with open(cmd, "w") as f:
        for i, c in enumerate(path): f.write(f"{i / 30:.4f} crop@fg x {px(c, fw)}, crop@bg x {px(c, cw)};\n")
    y = int(SRC_H * top)
    fc = (f"[0:v]fps=30,sendcmd=f=_kadr.txt,split[a][b];[a]crop@bg={cw}:{ch}:{px(path[0], cw)}:{y},scale=1080:1920,boxblur=40:2,eq=brightness=-0.06:saturation=0.8[bg];"
          f"[b]crop@fg={fw}:{ch}:{px(path[0], fw)}:{y},scale=1080:{FH}:flags=lanczos,eq=contrast=1.02:saturation=1.04,format=yuva420p[f0];"
          f"[1:v]format=gray,scale=1080:{FH}[m];[f0][m]alphamerge[fg];[bg][fg]overlay=0:{FY}:shortest=1")
    subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", f"{fs:.3f}", "-t", f"{ln:.3f}", "-i", PLIKI[clip], "-loop", "1", "-i", MASK, "-an",
                    "-filter_complex", fc, "-t", f"{ln:.3f}", "-q:v", "3", "%03d.jpg"], check=True, cwd=d)
    os.remove(cmd)
    return len(os.listdir(d))


def build(rid, only_timing=False):
    R = ROLKI[rid]; out = os.path.join(C4Y, rid); os.makedirs(out, exist_ok=True)
    t, lines, pieces = 0.0, [], []
    for i, (k, clip, t0, t1, text, cuts) in enumerate(R["segs"]):
        if i: t += GAP
        s = round(t, 3)
        A, B, ws = bounds(clip, t0, t1)
        oa, ob = OVR.get((rid, k), (None, None)); A = oa or A; B = ob or B
        txt = text.split()
        if len(txt) != len(ws): sys.exit(f"{rid} {k}: napisy {len(txt)} słów, whisper {len(ws)}: {' '.join(w[2] for w in ws)}")
        if not only_timing:  # głos wyrównany do tej samej głośności
            g = max(-10, min(12, -20 - mean_db(clip, A, B)))
            run(["-ss", f"{A - PAD:.3f}", "-t", f"{B - A + 2 * PAD:.3f}", "-i", PLIKI[clip], "-vn", "-ac", "2", "-ar", "48000",
                 "-af", f"highpass=f=80,volume={g:.1f}dB" + wygas(i == len(R["segs"]) - 1, B - A), os.path.join(out, f"vo_{k}.wav")])
        wd = []
        for j, (w, (ws0, we0, _)) in enumerate(zip(txt, ws)):
            st = max(0, ws0 - A); en = (ws[j + 1][0] - A) if j + 1 < len(ws) else B - A
            wd.append({"w": "" if w == "~" else w.replace("_", " "), "t": round(s + st, 3), "e": round(s + min(en, st + .7), 3)})
        lines.append({"key": k, "ch": "kol", "text": " ".join(x["w"] for x in wd), "slot": s, "src": [PAD, round(PAD + B - A, 3)], "file": f"vo_{k}.wav", "words": wd})
        last = i == len(R["segs"]) - 1
        for j, c in enumerate(cuts):
            off = c[0]; end = cuts[j + 1][0] if j + 1 < len(cuts) else B - A + (.8 if last else GAP)
            p = {"name": f"{rid}_{k}_{j}", "a": round(s + off, 3), "b": round(s + end, 3), "len": end - off + .12}
            if c[1] == "S": p.update(clip=clip, fs=A + off, sync=True, cx=c[2], hf=c[3], top=c[4], z=round(.81 / c[3], 3))
            else: p.update(clip=c[2], fs=c[3], sync=False, cx=c[4], hf=c[5], top=c[6], z=round(.81 / c[5], 3))
            pieces.append(p)
        t = s + (B - A)
    T = {"DUR": round(t + HOLD, 2), "DROP": -10, "BRK": None, "REDROP": None, "END": -10, "BAR": 2.0, "BEAT": .5, "H0": 0, "GRID0": 0, "ACC": [],
         "beats": [], "segments": [], "lines": lines, "chapters": [{"id": "kol", "title": "Kolmed", "a": 0, "z": round(t, 3), "ph": False}]}
    json.dump(T, open(os.path.join(out, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(out, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    open(os.path.join(out, "pieces.js"), "w", encoding="utf-8").write("window.PIECES = " + json.dumps(pieces) + ";\n")
    html = open(os.path.join(C4Y, "kolmed-zabiegi", "szablon.html"), encoding="utf-8").read()
    for a, b in {"__TITLE__": R["title"], "__HOOK__": R["hook"], "__HI__": R["hi"], "__END__": R["end"], "__LT__": R["lt"], "__ODO__": R["odo"] or "", "__HOOKTO__": R.get("hook_to", ""),
                 "__LTN__": R["ltp"][0], "__LTR__": R["ltp"][1], "__RID__": rid}.items(): html = html.replace(a, b)
    open(os.path.join(out, rid + ".html"), "w", encoding="utf-8").write(html)
    shutil.copy(os.path.join(C4Y, "kolmed", "logo2.png"), out)
    print(f"== {rid}  DUR {T['DUR']}  ujęć {len(pieces)}")
    for l in lines: print(f"  {l['slot']:6.2f}  {l['text']}")
    if only_timing: return
    man = {p["name"]: frames(p["name"], p["clip"], p["fs"], p["len"], p["cx"], p["hf"], p["top"], p["sync"]) for p in pieces}
    import pano
    pano.manifest_update(man)


if __name__ == "__main__":
    ids = [a for a in sys.argv[1:] if a in ROLKI]; steps = [a for a in sys.argv[1:] if a not in ROLKI]
    for rid in ids:
        out = os.path.join(C4Y, rid)
        if "timing" in steps: build(rid, only_timing=True)
        if "build" in steps: build(rid)
        if "stills" in steps:
            D = json.load(open(os.path.join(out, "timing.json"), encoding="utf-8"))["DUR"]
            c4ykit.stills(out, rid, [round(x * 1.0, 2) for x in range(int(D) + 1)])
        if "audio" in steps: c4ykit.audio(out, rid, "g4d_calm.mp3", bed=-27.0)
        if "render" in steps: c4ykit.render(out, rid, workers=3)
