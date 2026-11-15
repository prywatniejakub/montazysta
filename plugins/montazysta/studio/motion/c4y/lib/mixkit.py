r"""Ścieżka dźwiękowa rolek Clips4you bez osi lektora z timing.json: muzyka + efekty ze strony (window.SFX)
+ opcjonalne gotowe ścieżki (np. głos postaci AI z ustami, oryginalny dźwięk klienta) w podanych miejscach.
  mix(here, name, dur, music, tracks=[(plik, od_sekundy, dB, start_w_pliku, długość)], bed=-17)
"""
import os, sys
HERE_LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_LIB)
import c4ykit  # noqa: E402
longkit = c4ykit.longkit
AK = longkit.AK
kit = c4ykit.kit


def mix(here, name, dur, music, tracks=(), bed=-17.0, sfx=True, voice_lufs=-15.0):
    tmp = lambda n: os.path.join(here, f"_{n}.wav")
    AK.run(["-stream_loop", "-1", "-i", music, "-af",
            f"aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur},afade=t=in:d=0.3,afade=t=out:st={dur - 1.6:.2f}:d=1.6",
            "-c:a", "pcm_s24le", tmp("mus")])
    layers = [(tmp("mus"), bed - AK.lufs(tmp("mus")))]
    if tracks:  # gotowe ścieżki w miejscach na osi
        ins, fc = [], []
        for i, (f, at, gain, ss, ln) in enumerate(tracks):
            ins += ["-i", f]
            trim = f"atrim=start={ss:.3f}" + (f":duration={ln:.3f}" if ln else "")
            fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,{trim},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,"
                      f"volume={gain}dB,adelay={int(at * 1000)}:all=1,{AK.FILL},apad,atrim=0:{dur}[t{i}]")
        fc.append("".join(f"[t{i}]" for i in range(len(tracks))) + f"amix=inputs={len(tracks)}:normalize=0[o]")
        AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[o]", "-c:a", "pcm_s24le", tmp("trk")])
        layers.append((tmp("trk"), voice_lufs - AK.lufs(tmp("trk"))))
    if sfx:
        ev = longkit.page_sfx(here, name)
        if ev:
            ins, fc = [], []
            for n, (f, at, gain, maxlen) in enumerate(ev):
                path = f if os.path.isabs(f) else os.path.join(AK.LIB, f)
                pk = AK.PEAK.get(f)
                if pk is None:
                    pk = kit.peak(path); AK.PEAK[f] = pk
                start = at - pk
                ins += ["-i", path]
                chain = f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={max(0, -start):.4f}"
                if maxlen:
                    chain += f",afade=t=out:st={maxlen * .6:.3f}:d={maxlen * .4:.3f},atrim=0:{maxlen:.3f}"
                fc.append(chain + f",asetpts=PTS-STARTPTS,volume={gain}dB,adelay={int(max(0, start) * 1000)}:all=1,{AK.FILL},apad,atrim=0:{dur}[x{n}]")
            fc.append("".join(f"[x{n}]" for n in range(len(ev))) + f"amix=inputs={len(ev)}:normalize=0[fx]")
            AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[fx]", "-c:a", "pcm_s24le", tmp("fx")])
            layers.append((tmp("fx"), 0.0))
    ins = sum((["-i", p] for p, _ in layers), [])
    fc = ";".join(f"[{i}:a]volume={g:.2f}dB[l{i}]" for i, (_, g) in enumerate(layers))
    fc += ";" + "".join(f"[l{i}]" for i in range(len(layers))) + f"amix=inputs={len(layers)}:normalize=0,alimiter=limit=0.84:attack=3:release=60:level=disabled[o]"
    AK.run(ins + ["-filter_complex", fc, "-map", "[o]", "-c:a", "pcm_s24le", tmp("mix")])
    g = -14 - AK.lufs(tmp("mix"))
    out = os.path.join(here, "audio.wav")
    AK.run(["-i", tmp("mix"), "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled", "-c:a", "pcm_s16le", out])
    AK.run(["-i", out, "-c:a", "aac", "-b:a", "160k", os.path.join(here, name + ".m4a")])
    for f in os.listdir(here):
        if f.startswith("_") and f.endswith(".wav"):
            os.remove(os.path.join(here, f))
    print(f"audio: {dur} s, {len(layers)} warstwy")
