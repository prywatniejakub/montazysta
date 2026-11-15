r"""Wszystkie 8 rolek KOLMED w stylu D „karty ze szkła” (wybór użytkownika 2026-11-01). Głos, cięcia i klatki z gotowych rolek kz1..kz8,
nowy wygląd z szablon-styl.html. Wynik: motion/c4y/kzdN/kzdN.mp4. Kolejność (twarde, użytkownik): stills (arkusz) i audio -> przegląd -> render RAZ.
    ..\..\..\runtime\python.exe dstyl.py 1 2 3 4 5 6 7 8 stills audio      potem      ... 1 2 3 4 render   i   5 6 7 8 render
"""
import os, sys, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(C4Y, "lib"))
import c4ykit

PIL = ("lek. Sebastian Pilkiewicz", "w trakcie specjalizacji z otolaryngologii")  # poprawka Dariusza 2026-11-04: jeszcze nie specjalista
BEL = ("lek. Agata Bełżecka", "okulista · KOLMED")
PIE = ("dr n. med. Wojciech Pięta", "ginekolog endokrynolog · KOLMED")
# 2026-11-04 wieczór (użytkownik: napisy „za blisko twarzy”, „dynamiczniejsze, tam gdzie klatka piersiowa”): wysokość napisów osobno dla
# każdego ujęcia mówcy = broda z arkusza klatek + ok. 260 px (górna krawędź pigułki); podpis lekarza zawsze u góry, po zniknięciu haka
SZER = dict(capY=1100, capB=1240, ltY=150)  # nagrania lek. Pilkiewicza (telefon, lekarz siedzi/stoi)
CIAS = dict(capY=1440, capB=1440, ltY=150)  # zbliżenia z filmów 4K (kadr oddalony x1,18 w kolmed-yt/build.py)
CAPY = {"kz1_s1_0": 1223, "kz1_s2_0": 936, "kz1_s2_1": 1126, "kz1_s3_0": 963, "kz1_s4_0": 1153, "kz1_s5_0": 936,
        "kz2_s1_0": 1153, "kz2_s3_0": 1017, "kz2_s5_0": 1153,
        "kz3_s1_1": 1288, "kz3_s2_0": 1044, "kz3_s2_1": 1207, "kz3_s3_0": 1017, "kz3_s3b_1": 1153,
        "kz4_s1_0": 1261, "kz4_s1_1": 1017, "kz4_s1_2": 1180, "kz4_s2_0": 1071, "kz4_s3_0": 1180, "kz4_s4_0": 1044,
        # YouTube po oddaleniu: broda ok. 1150-1330 px, więc pod brodą; kz7_s1_0 = anestezjolog w masce na cały kadr, napisy niżej, pod maską
        "kz5_s1_0": 1460, "kz5_s2_0": 1460, "kz5_s3_0": 1460, "kz6_s2_0": 1400, "kz6_s3_0": 1400, "kz6_s3_2": 1420,
        # recenzent 2026-11-04: w zbliżeniach maska (kz7) i żuchwa (kz8) schodzą do ok. 1700 / 1500 px, więc napis na ramiona
        "kz7_s1_0": 1720, "kz8_s1_0": 1630, "kz8_s1_2": 1630, "kz8_s2_0": 1440, "kz8_s2_1": 1630}
# Filmy z YouTube mają własną muzykę pod głosem: bez naszego podkładu (było „podwójna muzyka, chaos”, 2026-11-04). Pod planszę końcową
# idzie ICH muzyka z fragmentu filmu bez mowy: kz7 i kz8 ciągną dalej to samo miejsce filmu (po ostatnim słowie jest przerwa), kz5 i kz6 z przerwy 180-232 s.
YT_SRC = {"oku": os.path.join(C4Y, "kolmed", "src", "oku_4k.mkv"), "gin": os.path.join(C4Y, "kolmed-yt", "src", "gin_4k.mkv")}
OGON = {5: ("oku", 181.0), 6: ("oku", 181.0), 7: ("oku", None), 8: ("gin", None)}  # None = od miejsca, gdzie urywa się głos
R = {
    1: dict(hook=["Narośl w okolicy", "policzka?"], label="KOLMED · laryngologia", end="Konsultacja laryngologiczna", lt="s2", lp=PIL, odo=None,
            hi=r"^(narośli|policzka|HPV|usunięcie|znieczuleniu)", **SZER),
    2: dict(hook=["Nos ciągle", "zatkany?"], label="KOLMED · laryngologia", end="Zatkany nos?", lt="s3", lp=PIL, odo="s5",
            hi=r"^(drożności|nosa|sterydowe|konchoplastyki|małżowin|radiowych|znieczuleniu)", **SZER),
    3: dict(hook=["Tak wygląda zabieg", "na zatkany nos"], label="KOLMED · sala zabiegowa", end="Zatkany nos?", lt="s2", lp=PIL, odo=None,
            hi=r"^(konchoplastyki|małżowin|znieczuleniu|elektrody|radiowe|odpocznie)", **SZER),
    4: dict(hook=["Brodawka w ustach", "lub nosie?"], label="KOLMED · laryngologia", end="Konsultacja laryngologiczna", lt="s1", lp=PIL, odo=None,
            hi=r"^(brodawkowate|HPV|brodawczaka|histopatologicznego|szczepieniu|laryngologiczne)", **SZER),
    5: dict(hook=["Usuwanie gradówek", "i kępek żółtych"], label="KOLMED · okulistyka", end="Konsultacja okulistyczna", lt="s2", ltT=3.7, lp=BEL, odo=None,  # podpis na jej ujęciach, nie na przebitce
            hi=r"^(powiek|gradówek|żółtych|włókniaków|prosaków|brodawek|entropionu|ektropionu)", **CIAS),
    6: dict(hook=["Skąd moda", "na plastykę powiek?"], label="KOLMED · okulistyka", end="Plastyka powiek", lt="s3", lp=BEL, odo=None,
            hi=r"^(powiek|popularne|COVID|maseczki|oczy|uwagę)", **CIAS),
    7: dict(hook=["Jakie znieczulenie", "przy zabiegu?"], label="KOLMED · sala zabiegowa", end="KOLMED Międzylesie", lt="", lp=("", ""), odo=None,
            hi=r"^(anestezjolog|analgosedacji|dożylnego|godziny|domu)", **CIAS),
    8: dict(hook=["Czym jest histeroskopia?"], label="KOLMED · ginekologia", end="Konsultacja ginekologiczna", lt="s2", ltT=8.3, lend={"s2": 21.38}, lp=PIE, odo=None,  # lend: ich film tnie na logo w 104,77 s  # s2 zaczyna się przebitką z logo, więc podpis przy jego ujęciu od 8 s
            hi=r"^(jamy|macicy|polipów|zrostów|miejscowym|ogólnym)", **CIAS),
}


def prep(n):
    rid = f"kzd{n}"; out = os.path.join(C4Y, rid); src = os.path.join(C4Y, f"kz{n}")
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(src):
        if f.startswith("vo_") or f in ("timing.js", "timing.json", "pieces.js"):
            shutil.copy(os.path.join(src, f), out)
    shutil.copy(os.path.join(HERE, "logo_w.png"), out)
    c = R[n]
    cfg = {"hi": c["hi"], "odo": c["odo"], "lt": c["lt"], "ltn": c["lp"][0], "ltr": c["lp"][1], "end": c["end"], "hook": c["hook"],
           "label": c["label"], "capY": c["capY"], "capB": c["capB"], "ltY": c["ltY"], "ltT": c.get("ltT"), "lend": c.get("lend"),
           "capYs": {k: v for k, v in CAPY.items() if k.startswith(f"kz{n}_")}}
    html = open(os.path.join(HERE, "szablon-styl.html"), encoding="utf-8").read()
    html = html.replace("__STYLE__", "D").replace("__RID__", rid).replace("__CFG__", json.dumps(cfg, ensure_ascii=False))
    open(os.path.join(out, rid + ".html"), "w", encoding="utf-8").write(html)
    return rid, out


def ogon(n, out, T):
    """„muzyka” dla rolek z YouTube: cisza do końca głosu, potem muzyka z ich filmu (wejście 0,35 s, gdy głos wygasa)"""
    import subprocess
    sys.path.insert(0, os.path.join(C4Y, "kolmed-yt")); import build as yb
    clip, st = OGON[n]; L = T["lines"][-1]; dl = L["src"][1] - L["src"][0]
    vend = L["slot"] + dl + .16; t0 = vend - .35
    if st is None:  # B ostatniej wypowiedzi w filmie = jej początek A + długość; A z tych samych granic co w build.py
        rid = f"kz{n}"; k, c, a1, b1, *_ = [s for s in yb.ROLKI[rid]["segs"] if s[0] == L["key"]][0]
        A, B, _w = yb.bounds(c, a1, b1); oa, ob = yb.OVR.get((rid, k), (None, None)); A = oa or A; B = ob or B
        st = B + .16 - .35
    p = os.path.join(out, "ogon.wav")
    subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", f"{st:.3f}", "-t", f"{T['DUR'] - t0 + .5:.3f}", "-i", YT_SRC[clip], "-vn",
                    "-af", f"aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.35,adelay={int(t0 * 1000)}:all=1,apad",
                    "-t", f"{T['DUR'] + .5:.3f}", "-c:a", "pcm_s16le", p], check=True)
    return p


def stills_times(T, c):
    L = {l["key"]: l for l in T["lines"]}; keys = [l["key"] for l in T["lines"]]
    ts = [.0, .6, L[keys[1]]["slot"] + .5]
    if c["lt"]: ts.append(L[c["lt"]]["slot"] + (1.4 if c["lt"] == keys[0] else .2) + 1.2)
    if c["odo"]: ts.append([w["t"] for w in L[c["odo"]]["words"] if w["w"].startswith("około")][0] + 1.3)
    ts += [L[keys[-1]]["slot"] + 1.0, T["DUR"] - .4]
    return sorted(set(round(t, 2) for t in ts))


if __name__ == "__main__":
    ns = [int(a) for a in sys.argv[1:] if a.isdigit()]; kroki = [a for a in sys.argv[1:] if not a.isdigit()]
    for n in ns:
        rid, out = prep(n)
        T = json.load(open(os.path.join(out, "timing.json"), encoding="utf-8"))
        if "stills" in kroki:
            shutil.rmtree(os.path.join(out, "stills"), ignore_errors=True)
            c4ykit.stills(out, rid, stills_times(T, R[n]))
        if "audio" in kroki:
            if n in OGON: c4ykit.audio(out, rid, ogon(n, out, T), bed=-27.0)
            else: c4ykit.audio(out, rid, "steady.mp3", bed=-27.0)
        if "render" in kroki: c4ykit.render(out, rid, workers=2)
