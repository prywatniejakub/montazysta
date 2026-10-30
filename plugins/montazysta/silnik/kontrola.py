"""Kontrole 0 zł: gotowy MP4 (klatka 0, dźwięk od t=0, 9:16, głośność) i głos lektora kontra tekst scenariusza."""
import difflib, json, pathlib, re, subprocess, sys, tempfile
import narzedzia as N
import dzwiek

LICZEBNIKI = set("""zero jeden jedna jedno dwa dwie dwóch dwoma trzy trzech cztery czterech pięć pięciu sześć sześciu siedem siedmiu osiem ośmiu
dziewięć dziewięciu dziesięć dziesięciu jedenaście dwanaście trzynaście czternaście piętnaście szesnaście siedemnaście osiemnaście
dziewiętnaście dwadzieścia dwudziestu trzydzieści czterdzieści czterdziestu pięćdziesiąt sześćdziesiąt siedemdziesiąt osiemdziesiąt
dziewięćdziesiąt sto stu dwieście trzysta czterysta pięćset sześćset siedemset osiemset dziewięćset tysiąc tysięcy""".split())


def mp4(plik, maks_s=None):
    plik = pathlib.Path(plik)
    info = json.loads(N.wyjscie([N.program("ffprobe"), "-v", "error", "-show_streams", "-show_format", "-of", "json", plik]) or "{}")
    v = next((s for s in info.get("streams", []) if s["codec_type"] == "video"), None)
    a = next((s for s in info.get("streams", []) if s["codec_type"] == "audio"), None)
    dl = float(info.get("format", {}).get("duration", 0))
    w = []
    def ok(warunek, opis, popr=""):
        w.append((bool(warunek), opis, popr))
    ok(v, "jest ścieżka wideo", "wyrenderuj ponownie")
    if v:
        ok(abs(v["width"] / v["height"] - 9 / 16) < .02, f"format 9:16 ({v['width']}x{v['height']})", "ustaw kadr 1080x1920")
        ok(v["height"] >= 1280, f"rozdzielczość pionowa {v['height']} px", "eksportuj w 1080x1920")
    ok(a, "jest ścieżka dźwięku", "dodaj głos lub muzykę")
    if a:
        st = float(a.get("start_time", 0) or 0)
        ok(st <= .05, f"dźwięk startuje od t={st:.2f} s", "głos ma grać od t=0")
        g = dzwiek.lufs(plik)
        ok(-17 <= g <= -11, f"głośność {g:.1f} LUFS (cel -14)", "powtórz polecenie dzwiek")
    if maks_s:
        ok(dl <= maks_s, f"długość {dl:.1f} s (maks. {maks_s} s)", "skróć montaż")
    else:
        w.append((True, f"długość {dl:.1f} s", ""))
    png = pathlib.Path(tempfile.gettempdir()) / f"{plik.stem}_klatka0.png"
    N.ff("-ss", 0, "-i", plik, "-frames:v", 1, png)
    st = N.wyjscie([N.program("ffmpeg"), "-v", "info", "-ss", "0", "-i", plik, "-frames:v", "1", "-vf", "signalstats,metadata=print", "-f", "null", "-"])
    m = {k: re.search(rf"\.{k}=([\d.]+)", st) for k in ("YAVG", "YMIN", "YMAX")}
    if all(m.values()):
        yavg, ymin, ymax = (float(m[k].group(1)) for k in ("YAVG", "YMIN", "YMAX"))
        ok(yavg > 16 or ymax - ymin > 60, f"klatka 0 nie jest czarna (jasność {yavg:.0f}/255)", "klatka 0 musi mieć obraz")
        ok(ymax - ymin > 60, f"klatka 0 ma treść (rozpiętość {ymax - ymin:.0f})", "dodaj obraz i tekst w klatce 0")
    else:
        w.append((False, "nie udało się zmierzyć klatki 0", f"obejrzyj {png}"))
    zle = [x for x in w if not x[0]]
    print(f"KONTROLA MP4: {plik.name}\n" + "\n".join(("  OK     " if o else "  POPRAW ") + op + ("" if o else f" -> {p}") for o, op, p in w))
    print(f"Klatka 0 do obejrzenia: {png}")
    print(f"WYNIK: DO POPRAWY ({len(zle)})" if zle else "WYNIK: PRZECHODZI")
    return 3 if zle else 0


def _norm(w):
    return re.sub(r"[^\w]", "", w.lower())


def glos(audio, tekst_plik, model="small", jezyk="pl"):
    """Czy lektor powiedział dokładnie tekst scenariusza. Różnice = miejsca do odsłuchu, poprawiamy tylko tę linię."""
    import transkrypcja as TR
    exp = [_norm(w) for w in pathlib.Path(tekst_plik).read_text(encoding="utf-8").split() if _norm(w)]
    ws, _ = TR.slowa(TR.model_whisper(model), audio, jezyk)
    got = [(_norm(c), w["s"]) for w in ws for c in w["w"].replace("-", " ").split() if _norm(c)]
    gw = [w for w, _ in got]
    roz = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=exp, b=gw, autojunk=False).get_opcodes():
        if op == "equal":
            continue
        e, g = exp[i1:i2], gw[j1:j2]
        if e and all(w in LICZEBNIKI for w in e) and g and all(re.fullmatch(r"\d+", w) for w in g):
            continue
        t = got[j1][1] if j1 < len(got) else (got[-1][1] if got else 0)
        roz.append((t, " ".join(e) or "(nic)", " ".join(g) or "(nic)"))
    print(f"oczekiwane słowa: {len(exp)}, usłyszane: {len(gw)}")
    if not roz:
        print("GŁOS OK: lektor powiedział tekst scenariusza.")
        return 0
    print(f"DO ODSŁUCHU ({len(roz)}):")
    for t, e, g in roz:
        print(f"  {t:6.2f} s  oczekiwane: {e!r}  usłyszane: {g!r}")
    return 1
