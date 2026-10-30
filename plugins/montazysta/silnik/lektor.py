"""Darmowy lektor Microsoft Edge (edge-tts). Każda linia = vo/<klucz>.mp3 + vo/<klucz>.json z czasem słów.
Edge robi długie pauzy po kropce, więc przerwy między słowami są skracane do ok. 0,24 s."""
import asyncio, json, re, time
import narzedzia as N

GLOSY = {"zofia": "pl-PL-ZofiaNeural", "marek": "pl-PL-MarekNeural"}


def _norm(w):
    return re.sub(r"[^\w]", "", w.lower())


async def _linia(tekst, glos, tempo, mp3):
    import edge_tts
    c = edge_tts.Communicate(tekst, glos, rate=tempo, boundary="WordBoundary")
    audio, ws = bytearray(), []
    async for k in c.stream():
        if k["type"] == "audio":
            audio += k["data"]
        elif k["type"] == "WordBoundary":
            ws.append({"w": k["text"], "s": k["offset"] / 1e7, "e": (k["offset"] + k["duration"]) / 1e7})
    if not audio or not ws:
        raise RuntimeError("pusta odpowiedź lektora")
    mp3.write_bytes(bytes(audio))
    return ws


def skroc_pauzy(vo, k, ws, maks=.3, zostaw=.24):
    segs, a = [], max(0.0, ws[0]["s"] - .06)
    for w, nx in zip(ws, ws[1:]):
        if nx["s"] - w["e"] > maks:
            segs.append((a, w["e"] + zostaw / 2)); a = nx["s"] - zostaw / 2
    segs.append((a, ws[-1]["e"] + .25))
    t, ciecia = 0.0, []
    for x, y in segs:
        ciecia.append((x, y, t - x)); t += y - x
    nowe = []
    for w in ws:
        sh = next(o for x, y, o in ciecia if x - 1e-6 <= w["s"] <= y + 1e-6)
        nowe.append({"w": w["w"], "s": round(w["s"] + sh, 3), "e": round(w["e"] + sh, 3)})
    fc = "".join(f"[0:a]atrim={x:.3f}:{y:.3f},asetpts=PTS-STARTPTS[s{i}];" for i, (x, y) in enumerate(segs))
    fc += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[o]"
    N.ff("-i", vo / f"{k}.mp3", "-filter_complex", fc, "-map", "[o]", "-ar", "48000", vo / f"{k}_t.wav")
    return nowe, round(t, 3)


def uruchom(P):
    S = N.spec(P)
    L = S.get("lektor")
    if not L:
        raise SystemExit("Ten projekt nie ma sekcji lektor w rolka.json.")
    glos, tempo = GLOSY.get(L.get("glos", "zofia"), L.get("glos")), L.get("tempo", "+4%")
    vo = P / "vo"; vo.mkdir(exist_ok=True)
    for ln in L["linie"]:
        k, tekst = ln["klucz"], ln["tekst"]
        jp = vo / f"{k}.json"
        if jp.exists():
            j = json.loads(jp.read_text(encoding="utf-8"))
            if j["tekst"] == tekst and j["glos"] == glos and j["tempo"] == tempo:
                continue
        for proba in range(5):
            try:
                ws = asyncio.run(_linia(tekst, glos, tempo, vo / f"{k}.mp3")); break
            except Exception as e:
                if proba == 4:
                    raise
                print("ponawiam", k, str(e)[:80]); time.sleep(3 * (proba + 1))
        toks = tekst.split()
        if [_norm(w["w"]) for w in ws] == [_norm(t) for t in toks]:  # Edge gubi interpunkcję, wracamy do tekstu
            ws = [{**w, "w": t} for w, t in zip(ws, toks)]
        ws, dl = skroc_pauzy(vo, k, ws)
        jp.write_text(json.dumps({"tekst": tekst, "glos": glos, "tempo": tempo, "slowa": ws, "dl": dl}, ensure_ascii=False, indent=0), encoding="utf-8")
        print(f"{dl:5.2f} s  {tekst}")
