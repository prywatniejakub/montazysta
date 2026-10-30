"""Buduje rolkę z rolka.json: plan ujęć, klatki JPG 1080x1920, oś czasu napisów, ścieżka głosu i strona rolka.html.
Dwa tryby: nagranie z własnym głosem (ujecia + fragmenty z transkrypcji) i lektor (lektor.linie + ich ujęcia)."""
import hashlib, json, re, shutil
import narzedzia as N

MAKS_UJECIE = 2.2      # zmiana obrazu co 1-2 s: dłuższe ujęcie dzieli się na słowie i skacze plan szeroki / zbliżenie
ZOOM_BLISKO = 1.22
_SONDY = {}
_FILTRY = {}


def sonda(plik):
    plik = str(plik)
    if plik not in _SONDY:
        j = json.loads(N.wyjscie([N.program("ffprobe"), "-v", "error", "-show_streams", "-show_format", "-of", "json", plik]))
        v = next(s for s in j["streams"] if s["codec_type"] == "video")
        rot = int(float(v.get("tags", {}).get("rotate", 0) or 0))
        for sd in v.get("side_data_list", []):
            rot = int(float(sd.get("rotation", rot) or rot))
        w, h = v["width"], v["height"]
        if abs(rot) % 180 == 90:
            w, h = h, w
        _SONDY[plik] = {"w": w, "h": h, "dl": float(j["format"].get("duration", 0)), "trc": v.get("color_transfer", ""),
                        "kl": v.get("avg_frame_rate", ""), "glos": any(s["codec_type"] == "audio" for s in j["streams"])}
    return _SONDY[plik]


def ma_filtr(nazwa):
    if nazwa not in _FILTRY:
        _FILTRY[nazwa] = f" {nazwa} " in N.wyjscie([N.program("ffmpeg"), "-hide_banner", "-filters"])
    return _FILTRY[nazwa]


def filtr_hdr(inf):
    """iPhone nagrywa domyślnie w HDR: bez mapowania tonów obraz wychodzi szary i wyblakły."""
    if inf["trc"] not in ("arib-std-b67", "smpte2084"):
        return []
    if ma_filtr("zscale") and ma_filtr("tonemap"):
        return ["zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709", "tonemap=tonemap=hable:desat=0", "zscale=t=bt709:m=bt709:r=tv", "format=yuv420p"]
    return ["eq=saturation=1.3:contrast=1.08:gamma=0.92"]


def kadr(inf, sp):
    W0, H0, z = inf["w"], inf["h"], sp.get("zoom", 1) or 1
    bw, bh = (H0 * 9 / 16, H0) if W0 / H0 > 9 / 16 else (W0, W0 * 16 / 9)
    cw, ch = int(bw / z) // 2 * 2, int(bh / z) // 2 * 2
    x = max(0, min(W0 - cw, int(sp.get("cx", .5) * W0 - cw / 2)))
    y = max(0, min(H0 - ch, int(sp.get("cy", .45) * H0 - ch / 2)))
    return cw, ch, x, y


def klatki(P, plik, sp, dl):
    """Wycina ujęcie do klatek; ten sam fragment przy kolejnej budowie bierze się z pamięci."""
    inf = sonda(plik)
    v = sp.get("predkosc", 1) or 1
    od = max(0.0, min(float(sp["od"]), max(0.0, inf["dl"] - .1)))
    need = dl * v + .15
    cw, ch, x, y = kadr(inf, sp)
    klucz = hashlib.sha1(json.dumps([str(plik), round(od, 3), round(need, 3), v, cw, ch, x, y]).encode()).hexdigest()[:10]
    nazwa = "p" + klucz
    d = P / "klatki" / nazwa
    if not (d.exists() and any(d.iterdir())):
        d.mkdir(parents=True, exist_ok=True)
        vf = filtr_hdr(inf) + [f"fps={N.FPS / v:.4f}", f"crop={cw}:{ch}:{x}:{y}", "scale=1080:1920:flags=lanczos"]
        N.ff("-ss", f"{od:.3f}", "-t", f"{need:.3f}", "-i", plik, "-an", "-vf", ",".join(vf), "-q:v", "3", d / "%03d.jpg")
    if cw < 1080:
        print(f"  uwaga: kadr {cw}x{ch} jest rozciągany do 1080: przy mocnym zoomie obraz zmięknie ({nazwa})")
    return nazwa, len(list(d.iterdir()))


def sp_zrodla(S, k, **nadpisz):
    wpis = S["zrodla"][k]
    baza = {kk: wpis[kk] for kk in ("cx", "cy", "zoom") if isinstance(wpis, dict) and kk in wpis}
    return {**baza, **{kk: v for kk, v in nadpisz.items() if v is not None}}


def transkrypt(P, k):
    p = P / "transkrypcja" / f"{k}.json"
    if not p.exists():
        raise SystemExit(f"Brak transkrypcji źródła {k}: uruchom polecenie transkrypcja.")
    return json.loads(p.read_text(encoding="utf-8"))


def zakres(u, tr):
    """Fragment(y) z transkrypcji albo jawne od/do. Cięcie na granicy słów, z marginesem, bez wchodzenia w sąsiednie słowa."""
    if "frag" in u:
        ns = u["frag"] if isinstance(u["frag"], list) else [u["frag"]]
        fr = {f["n"]: f for f in tr["fragmenty"]}
        od, do = fr[ns[0]]["od"], fr[ns[-1]]["do"]
    else:
        od, do = float(u["od"]), float(u["do"])
    przed = [w["e"] for w in tr["slowa"] if w["e"] <= od + .02]
    po = [w["s"] for w in tr["slowa"] if w["s"] >= do - .02]
    return max(od - .05, (przed[-1] + .01) if przed else 0), min(do + .12, (po[0] - .01) if po else do + .12)


def podziel(od, do, ws, maks):
    """Długie ujęcie dzielę na słowach, żeby obraz zmieniał się co 1-2 s, a głos szedł bez przerwy."""
    n = int((do - od) / maks)
    if n < 1 or not ws:
        return [(od, do)]
    gr = [od]
    for k in range(1, n + 1):
        cel = od + (do - od) * k / (n + 1)
        w = min(ws, key=lambda x: abs(x["s"] - cel))
        if od + .6 < w["s"] < do - .6 and w["s"] > gr[-1] + .6:
            gr.append(w["s"])
    gr.append(do)
    return list(zip(gr, gr[1:]))


def popraw(w, S):
    for z, na in S.get("poprawki", {}).items():
        w = re.sub(re.escape(z), na, w, flags=re.I)
    return w


def plan_nagranie(P, S):
    """Tryb własnego głosu: każda pozycja ujecia = fragment nagrania; głos leci z nagrania, napisy z transkrypcji."""
    maks = S.get("maks_ujecie", MAKS_UJECIE)
    bl = S.get("zoom_blisko", ZOOM_BLISKO)
    t, n = 0.0, 0
    pieces, linie, segs = [], [], []
    for iu, u in enumerate(S["ujecia"]):
        k = u["zrodlo"]
        tr = transkrypt(P, k)
        plik = N.sciezka_zrodla(P, S["zrodla"][k])
        od, do = zakres(u, tr)
        ws = [w for w in tr["slowa"] if w["s"] >= od - .02 and w["e"] <= do + .02]
        segs.append((plik, od, do))
        linie.append({"key": f"u{iu}", "slot": round(t, 3), "text": " ".join(w["w"] for w in ws),
                      "words": [{"w": popraw(w["w"], S), "t": round(t + w["s"] - od, 3), "e": round(t + w["e"] - od, 3)} for w in ws]})
        for j, (x, y) in enumerate([(od, do)] if u.get("bez_podzialu") else podziel(od, do, ws, maks)):
            wst = u.get("wstawka")
            zoom_baza = sp_zrodla(S, k).get("zoom", 1)
            if wst:
                sp = sp_zrodla(S, wst["zrodlo"], **{a: wst.get(a) for a in ("od", "zoom", "cx", "cy", "predkosc")})
                sp["od"] = float(wst.get("od", 0)) + (x - od) * sp.get("predkosc", 1)
                src = N.sciezka_zrodla(P, S["zrodla"][wst["zrodlo"]])
            else:
                sp = sp_zrodla(S, k, zoom=u.get("zoom", zoom_baza * (1 if n % 2 == 0 else bl)), cx=u.get("cx"), cy=u.get("cy"), od=x)
                src = plik
            pieces.append({"src": src, "sp": sp, "a": round(t + x - od, 3), "b": round(t + y - od, 3), "wst": bool(wst),
                           "przejscie": u.get("przejscie") if j == 0 else None})
            n += 1
        t += do - od
    return pieces, linie, segs, t


def plan_lektor(P, S):
    """Tryb lektora: każda linia ma swoje ujęcia dzielone po równo na czas linii."""
    L = S["lektor"]
    t = 0.0
    pieces, linie, segs = [], [], []
    wiersze = L["linie"]
    for i, ln in enumerate(wiersze):
        j = json.loads((P / "vo" / f"{ln['klucz']}.json").read_text(encoding="utf-8"))
        slot = round(t, 3)
        segs.append((P / "vo" / f"{ln['klucz']}_t.wav", 0, j["dl"]))
        linie.append({"key": ln["klucz"], "slot": slot, "text": j["tekst"],
                      "words": [{"w": popraw(w["w"], S), "t": round(slot + w["s"], 3), "e": round(slot + w["e"], 3)} for w in j["slowa"]]})
        przerwa = ln.get("przerwa", L.get("przerwa", .28)) if i + 1 < len(wiersze) else 0
        koniec = t + j["dl"] + przerwa
        uj = ln.get("ujecia") or [ln]
        seg = (koniec - t) / len(uj)
        for q, u in enumerate(uj):
            sp = sp_zrodla(S, u["zrodlo"], **{a: u.get(a) for a in ("od", "zoom", "cx", "cy", "predkosc")})
            sp.setdefault("od", 0)
            pieces.append({"src": N.sciezka_zrodla(P, S["zrodla"][u["zrodlo"]]), "sp": sp, "a": round(t + q * seg, 3), "b": round(t + (q + 1) * seg, 3),
                           "wst": True, "przejscie": u.get("przejscie")})
        if przerwa:
            segs.append((None, 0, przerwa))
        t = koniec
    return pieces, linie, segs, t


def sciezka_glosu(P, segs, wlasny):
    """Skleja głos: krótkie wygaszenia na cięciach (bez trzasków); nagranie dostaje delikatną kompresję."""
    d = P / "_seg"
    shutil.rmtree(d, ignore_errors=True); d.mkdir()
    pliki = []
    for i, (plik, od, do) in enumerate(segs):
        c = d / f"{i:03d}.wav"
        dl = do - od
        if plik is None:
            N.ff("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", f"{dl:.3f}", "-c:a", "pcm_s16le", c)
        else:
            N.ff("-ss", f"{od:.3f}", "-t", f"{dl:.3f}", "-i", plik, "-vn", "-ac", "2", "-ar", "48000",
                 "-af", f"afade=t=in:d=0.012,afade=t=out:st={max(0, dl - .02):.3f}:d=0.02", "-c:a", "pcm_s16le", c)
        pliki.append(c)
    lst = d / "lista.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in pliki), encoding="utf-8")
    af = ["-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120:makeup=2"] if wlasny else []
    N.ff("-f", "concat", "-safe", "0", "-i", lst, *af, "-c:a", "pcm_s16le", P / "glos.wav")
    shutil.rmtree(d, ignore_errors=True)


def norm_slowo(w):
    return re.sub(r"[^\w]", "", w.lower())


def kotwice(S, linie):
    """W licznikach i kartach można podać słowo zamiast sekundy: „kotwica”: „czterysta”."""
    ws = [w for l in linie for w in l["words"]]
    out = []
    for c in S.get("liczniki", []):
        c = dict(c)
        if "kotwica" in c:
            n = norm_slowo(c["kotwica"])
            hit = next((w for w in ws if norm_slowo(w["w"]).startswith(n)), None)
            if not hit:
                raise SystemExit(f"Nie ma słowa {c['kotwica']} w głosie.")
            c.setdefault("od", hit["t"])
        c.setdefault("do", c["od"] + 1.0)
        c.setdefault("koniec", c["do"] + .8)
        out.append(c)
    return out


def uruchom(P):
    S = N.spec(P)
    wlasny = not S.get("lektor")
    pieces, linie, segs, t = plan_nagranie(P, S) if wlasny else plan_lektor(P, S)
    kon = S.get("koniec")
    ost = pieces[-1]
    if kon:
        dur = round(t + kon.get("sekundy", 2.5), 2)
        tlo = kon.get("tlo")
        if tlo:
            sp = sp_zrodla(S, tlo["zrodlo"], **{a: tlo.get(a) for a in ("od", "zoom", "cx", "cy")})
            src = N.sciezka_zrodla(P, S["zrodla"][tlo["zrodlo"]])
        else:  # koniec gra ruch sprzed cięcia: nigdy zamrożona klatka postaci
            src, sp = ost["src"], {**ost["sp"], "od": max(0, ost["sp"]["od"] - kon.get("sekundy", 2.5))}
        nm, ile = klatki(P, src, sp, dur - t + .5)
        endp = {"name": nm, "a": round(t, 3)}
    else:
        dur = round(t + S.get("zapas", .35), 2)
        ost["b"] = dur
        endp = None
    man = {}
    wynik = []
    wstawka_przed = False
    for i, p in enumerate(pieces):
        nm, ile = klatki(P, p["src"], p["sp"], p["b"] - p["a"])
        man[nm] = ile
        zmiana = i > 0 and (p["wst"] != wstawka_przed or p["src"] != pieces[i - 1]["src"])
        przej = p["przejscie"] or ("whip" if zmiana and (S.get("styl") != "spokojny") else "fade" if S.get("styl") == "spokojny" and zmiana else "ciecie")
        wynik.append({"name": nm, "a": p["a"], "b": p["b"], "slow": (p["sp"].get("predkosc", 1) or 1) < 1, "wh": przej == "whip", "fade": przej == "fade",
                      "dir": 1 if i % 4 == 1 else -1, "zmiana": bool(zmiana)})
        wstawka_przed = p["wst"]
    if endp:
        man[endp["name"]] = ile
    (P / "klatki").mkdir(exist_ok=True)
    N.zapisz_js(P / "klatki" / "manifest.js", CLIPN=man)
    T = {"DUR": dur, "lines": linie}
    (P / "timing.json").write_text(json.dumps(T, ensure_ascii=False, indent=0), encoding="utf-8")
    N.zapisz_js(P / "timing.js", TIMING=T)
    CFG = {k: S.get(k) for k in ("hak", "hak_do", "akcent", "wyroznij", "styl", "znaczek_ai", "koniec")}
    CFG["liczniki"] = kotwice(S, linie)
    N.zapisz_js(P / "pieces.js", PIECES=wynik, ENDP=endp, CFG=CFG)
    web = P / "web"
    shutil.rmtree(web, ignore_errors=True)
    shutil.copytree(N.SILNIK / "web", web)
    dod = '<script src="dodatki.js"></script>\n' if (P / "dodatki.js").exists() else ""
    (P / "rolka.html").write_text(f"""<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><title>{P.name}</title><link rel="stylesheet" href="web/styl.css"></head>
<body>
<script src="klatki/manifest.js"></script>
<script src="timing.js"></script>
<script src="pieces.js"></script>
<script src="web/rdzen.js"></script>
<script src="web/prem.js"></script>
<script src="web/rolka.js"></script>
{dod}<script>rolka(window.CFG);</script>
</body></html>
""", encoding="utf-8")
    sciezka_glosu(P, segs, wlasny)
    print(f"plan: {len(wynik)} ujęć, {dur} s, zmiana obrazu średnio co {dur / max(1, len(wynik)):.1f} s")
    for w in wynik:
        print(f"  {w['a']:6.2f}-{w['b']:6.2f}  {'whip' if w['wh'] else 'fade' if w['fade'] else 'cięcie'}")
