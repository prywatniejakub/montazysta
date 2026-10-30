"""Darmowa transkrypcja lokalna (faster-whisper, 0 zł) z czasem każdego słowa.
Wynik: transkrypcja/<klucz>.json (słowa i ponumerowane fragmenty) + <klucz>.txt do czytania: „#12 [45.20-47.90] tekst”.
Model pobiera się raz do ~/.montazysta/modele (small ok. 0,5 GB)."""
import json, re, subprocess
import narzedzia as N

PAUZA = .28  # nowy fragment po takiej ciszy albo po końcu zdania


def pcm(plik):
    import numpy as np
    r = subprocess.run([N.program("ffmpeg"), "-v", "error", "-i", str(plik), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True)
    return np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768.0


def model_whisper(nazwa):
    from faster_whisper import WhisperModel
    return WhisperModel(nazwa, device="cpu", compute_type="int8", download_root=str(N.DOM / "modele"))


def slowa(model, plik, jezyk, slownik=None):
    segs, info = model.transcribe(pcm(plik), language=jezyk, beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt=slownik)
    out = []
    for s in segs:
        for w in s.words or []:
            t = w.word.strip()
            if t:
                out.append({"w": t, "s": round(w.start, 3), "e": round(w.end, 3)})
    return out, info


def fragmenty(ws):
    out, cur = [], []
    for i, w in enumerate(ws):
        cur.append(w)
        nast = ws[i + 1] if i + 1 < len(ws) else None
        if nast is None or nast["s"] - w["e"] >= PAUZA or re.search(r"[.?!…]$", w["w"]):
            out.append({"n": len(out) + 1, "od": cur[0]["s"], "do": cur[-1]["e"], "tekst": " ".join(x["w"] for x in cur)})
            cur = []
    return out


def uruchom(P, model_nazwa="small", jezyk="pl", tylko=None):
    S = N.spec(P)
    (P / "transkrypcja").mkdir(exist_ok=True)
    model = None
    for k, wpis in S["zrodla"].items():
        if (tylko and k != tylko) or (isinstance(wpis, dict) and wpis.get("bez_glosu")):
            continue
        cel = P / "transkrypcja" / f"{k}.json"
        if cel.exists():
            print("jest", cel.name); continue
        model = model or model_whisper(model_nazwa)
        ws, info = slowa(model, N.sciezka_zrodla(P, wpis), jezyk, S.get("slownik"))
        fr = fragmenty(ws)
        cel.write_text(json.dumps({"jezyk": info.language, "dlugosc": info.duration, "slowa": ws, "fragmenty": fr}, ensure_ascii=False, indent=0), encoding="utf-8")
        (P / "transkrypcja" / f"{k}.txt").write_text("\n".join(f"#{f['n']} [{f['od']:.2f}-{f['do']:.2f}] {f['tekst']}" for f in fr) + "\n", encoding="utf-8")
        print(f"OK {k}: {info.language}, {info.duration:.0f} s, {len(ws)} słów, {len(fr)} fragmentów -> transkrypcja/{k}.txt")
