"""Miks rolki: głos -15 LUFS, muzyka pod głosem, efekty ze strony (window.SFX), limiter, całość -14 LUFS (poziom platform).
Efekty są własne (scripts/generuj_sfx.py), muzyka to pliki z audio/muzyka albo ~/Montaz/muzyka."""
import json, re
import narzedzia as N
import render

# sekunda szczytu efektu: tak ustawiamy go równo z cięciem
SZCZYT = {"WH_SOFT": .22, "WH_SWING": .16, "IMP_SOFT": .01, "IMP_BASS": .01, "POP": 0}
PODKLAD = {"dynamiczny": -21.0, "spokojny": -24.0}


def lufs(plik):
    o = N.wyjscie([N.program("ffmpeg"), "-hide_banner", "-nostats", "-i", plik, "-af", "ebur128=framelog=quiet", "-f", "null", "-"])
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", o)
    return float(m[-1]) if m else -30.0


def muzyka(nazwa):
    for d in (N.PRACA / "muzyka", N.SILNIK / "audio" / "muzyka"):
        for p in (d / nazwa, d / f"{nazwa}.mp3", d / f"{nazwa}.wav"):
            if p.exists():
                return p
    raise SystemExit(f"Nie ma muzyki {nazwa}.")


def efekty(P):
    b = render.Browser()
    try:
        b.open(P / "rolka.html")
        return json.loads(b.js("JSON.stringify(window.SFX)"))
    finally:
        b.close()


def uruchom(P):
    S = N.spec(P)
    T = json.loads((P / "timing.json").read_text(encoding="utf-8"))
    DUR = T["DUR"]
    tmp = lambda n: P / f"_{n}.wav"
    N.ff("-i", P / "glos.wav", "-af", f"apad,atrim=0:{DUR},aresample=48000,aformat=channel_layouts=stereo", "-c:a", "pcm_s24le", tmp("vo"))
    wejscia = ["-i", tmp("vo")]
    gv = -15.0 - lufs(tmp("vo"))
    fc = [f"[0:a]volume={gv:.2f}dB[a]"]
    etyk = ["[a]"]
    nazwa = S.get("muzyka", "spokojny" if S.get("styl") == "spokojny" else "dynamiczny")
    if nazwa:
        N.ff("-stream_loop", "-1", "-i", muzyka(nazwa), "-af",
             f"aresample=48000,aformat=channel_layouts=stereo,atrim=0:{DUR},afade=t=in:d=0.3,afade=t=out:st={max(0, DUR - 1.5):.2f}:d=1.5", "-c:a", "pcm_s24le", tmp("mus"))
        bed = S.get("muzyka_db", PODKLAD.get(S.get("styl", "dynamiczny"), -21.0))
        gm = bed - lufs(tmp("mus"))
        wejscia += ["-i", tmp("mus")]
        fc.append(f"[1:a]volume={gm:.2f}dB[b]"); etyk.append("[b]")
    ev = efekty(P) + list(S.get("sfx", []))
    if ev:
        ins, fx = [], []
        for n, (nm, at, gain, maxlen) in enumerate((list(e) + [None] * 4)[:4] for e in ev):
            start = at - SZCZYT.get(nm, 0)
            ins += ["-i", N.SILNIK / "audio" / "sfx" / f"{nm}.wav"]
            fx.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={max(0, -start):.4f},asetpts=PTS-STARTPTS,"
                      f"volume={gain if gain is not None else -14}dB,adelay={int(max(0, start) * 1000)}:all=1,apad,atrim=0:{DUR}[x{n}]")
        fx.append("".join(f"[x{n}]" for n in range(len(ev))) + f"amix=inputs={len(ev)}:normalize=0[fx]")
        N.ff(*ins, "-filter_complex", ";".join(fx), "-map", "[fx]", "-c:a", "pcm_s24le", tmp("fx"))
        k = len(etyk)
        wejscia += ["-i", tmp("fx")]
        etyk.append(f"[{k}:a]")
    fc.append("".join(etyk) + f"amix=inputs={len(etyk)}:normalize=0,alimiter=limit=0.84:attack=3:release=60:level=disabled[o]")
    N.ff(*wejscia, "-filter_complex", ";".join(fc), "-map", "[o]", "-c:a", "pcm_s24le", tmp("mix"))
    g = -14 - lufs(tmp("mix"))
    N.ff("-i", tmp("mix"), "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled", "-c:a", "pcm_s16le", P / "audio.wav")
    N.ff("-i", P / "audio.wav", "-c:a", "aac", "-b:a", "160k", P / "rolka.m4a")
    for f in P.glob("_*.wav"):
        f.unlink()
    print(f"dźwięk: {DUR} s, głos {gv:+.1f} dB, {len(ev)} efektów")
