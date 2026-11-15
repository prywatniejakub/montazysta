"""Shared build steps of the 16:9 lessons (lib/long.js pages): per-chapter voice, a global timeline, soundtrack with the
SFX the page declares (read back with headless Edge), stills.  A lesson's script.py defines CHAPTERS + GAPS and calls run().

CHAPTERS = [(chapter_id, title, [(line_key, text), ...]), ...]; GAPS = {line_key: pause before the line (s)}.
Voice is cached per chapter in vo/<id>/ (delete one folder to re-voice only that chapter).
"""
import json, os, subprocess, sys
KUBA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, KUBA)
import kit
import voicekit
import audiokit as AK

MUSIC = os.path.join(kit.ASSETS, "music", "steady.mp3")


def _words_to_line(text, words, file):
    speech = [w for w in words if any(ch.isalnum() for ch in w["w"])]
    return {"text": text, "start": speech[0]["s"], "end": speech[-1]["e"], "words": words, "file": file}


def _placeholder(d, texts, cps=15.0):
    """no voice (e.g. out of ElevenLabs credits): words evenly timed at ~cps, silent in the mix, captions still show"""
    out, t = [], 0.0
    for tx in texts:
        ws = []
        for w in tx.split():
            dur = (len(w) + 1) / cps
            ws.append({"w": w, "s": round(t, 3), "e": round(t + dur * .9, 3)})
            t += dur
        out.append(_words_to_line(tx, ws, None))
        t += .35
    json.dump({"placeholder": True, "lines": out}, open(os.path.join(d, "lines.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def voice(here, chapters, voice_id=kit.REEL):
    """a chapter of plain strings = one new ElevenLabs take; a chapter of dicts = lines reused from earlier takes:
    {"from": "lekcja1/vo/yours", "line": 1, "words": [5, None]} (folder relative to motion/kuba, optional word slice)"""
    for cid, _, lines in chapters:
        d = os.path.join(here, "vo", cid)
        os.makedirs(d, exist_ok=True)
        print(f"== {cid}")
        specs = [s for _, s in lines]
        if all(isinstance(s, dict) for s in specs):
            out = []
            for s in specs:
                src = os.path.join(KUBA, s["from"])
                L = _load_lines(src)[s["line"]]
                ws = L["words"]
                if s.get("words"):
                    real = [w for w in ws if w["w"].strip()]
                    ws = real[slice(*s["words"])]
                out.append(_words_to_line(" ".join(w["w"] for w in ws), ws, os.path.relpath(os.path.join(src, "voice.mp3"), d)))
                print(f"  reuse {s['from']}#{s['line']}: {out[-1]['text']}")
            json.dump({"lines": out}, open(os.path.join(d, "lines.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            continue
        try:
            voicekit.generate(d, specs, voice=voice_id)
        except Exception as e:  # out of credits etc.: keep building with a silent placeholder
            print(f"  !! no voice for '{cid}' ({str(e)[:120]}) -> placeholder")
            if not os.path.exists(os.path.join(d, "voice.mp3")):
                _placeholder(d, specs)


def _load_lines(d):
    """lines.json of a take: a plain list (voicekit) or {"lines": [...], "placeholder"?} (reused / placeholder)"""
    j = json.load(open(os.path.join(d, "lines.json"), encoding="utf-8"))
    if isinstance(j, dict):
        return j["lines"]
    return [{**l, "file": "voice_t.mp3" if l.get("tight") else "voice.mp3"} for l in j]  # voice_t = pauses cut (kit.tighten)


def timing(here, chapters, gaps, gap=.3, ch_gap=.9, t0=.4, hold=2.5):
    T = {"DUR": 0, "DROP": -10, "BRK": None, "REDROP": None, "END": -10, "BAR": 2.0, "BEAT": .5, "H0": 0,
         "GRID0": 0, "ACC": [], "beats": [], "segments": [], "lines": [], "chapters": []}
    t = t0
    for ci, (cid, title, lines) in enumerate(chapters):
        d = os.path.join(here, "vo", cid)
        got = _load_lines(d)
        if ci:
            t += gaps.get("@" + cid, ch_gap)  # "@chapter" in GAPS = pause before that chapter
        c0 = t
        for li, ((key, _), l) in enumerate(zip(lines, got)):
            if li:
                t += gaps.get(key, gap)
            s = round(t, 3)
            f = l.get("file")
            T["lines"].append({"key": key, "ch": cid, "text": l["text"], "slot": s, "src": [l["start"], l["end"]],
                               "file": os.path.relpath(os.path.join(d, f), here) if f else None,
                               "words": [{"w": w["w"], "t": round(s + w["s"] - l["start"], 3), "e": round(s + w["e"] - l["start"], 3)}
                                         for w in l["words"]]})
            t += l["end"] - l["start"]
        T["chapters"].append({"id": cid, "title": title, "a": round(c0, 3), "z": round(t, 3), "ph": any(not l.get("file") for l in got)})
    T["DUR"] = round(t + hold, 2)
    json.dump(T, open(os.path.join(here, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(here, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    for c in T["chapters"]:
        print(f"{c['a']:7.2f} - {c['z']:7.2f}  {c['title']}")
    print(f"DUR {T['DUR']} s = {T['DUR'] / 60:.2f} min")
    return T


def page_sfx(here, name, port=9341):
    sys.path.insert(0, kit.MOTION)
    import render
    b = render.Browser(port)
    try:
        b.open(os.path.join(here, name + ".html"))
        ev = b.js("JSON.stringify(window.SFX)")
    finally:
        b.close()
    out = [(getattr(AK, n) if hasattr(AK, n) else n, at, g, ml) for n, at, g, ml in json.loads(ev)]
    print(f"sfx: {len(out)} events from the page")
    return out


def audio(here, name, sfx, music=MUSIC, bed=-27.0):
    T = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))
    DUR = T["DUR"]
    tmp = lambda n: os.path.join(here, f"_{n}.wav")
    chs = []
    for c in T["chapters"]:
        L = [l for l in T["lines"] if l["ch"] == c["id"] and l.get("file")]
        if not L:
            print(f"  (no voice in '{c['id']}': silent)")
            continue
        base, clen = max(0.0, L[0]["slot"] - .1), L[-1]["slot"] - L[0]["slot"] + (L[-1]["src"][1] - L[-1]["src"][0]) + .6
        fc, ins = [], []
        for i, ln in enumerate(L):
            a, z = ln["src"]
            # trim padding only against the neighbour line of the same take (reused lines come from different takes)
            a = max(0, a - .05) if i == 0 or L[i - 1]["file"] != ln["file"] or L[i - 1]["src"][1] > a else max(L[i - 1]["src"][1] + .02, a - .05)
            z = z + .16 if i == len(L) - 1 or L[i + 1]["file"] != ln["file"] or L[i + 1]["src"][0] < z else min(L[i + 1]["src"][0] - .03, z + .16)
            ins += ["-i", os.path.join(here, ln["file"])]
            fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={a:.3f}:{z:.3f},asetpts=PTS-STARTPTS,"
                      f"afade=t=in:d=0.02,afade=t=out:st={max(0, z - a - .06):.3f}:d=0.06,"
                      f"adelay={int(max(0, ln['slot'] - base - (ln['src'][0] - a)) * 1000)}:all=1,{AK.FILL},apad,atrim=0:{clen:.3f}[v{i}]")
        fc.append("".join(f"[v{i}]" for i in range(len(L))) + f"amix=inputs={len(L)}:normalize=0[vo]")
        AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[vo]", "-c:a", "pcm_s24le", tmp("ch_" + c["id"])])
        chs.append((tmp("ch_" + c["id"]), base))
    ins, fc = [], []
    for i, (p, base) in enumerate(chs):
        ins += ["-i", p]
        fc.append(f"[{i}:a]adelay={int(base * 1000)}:all=1,{AK.FILL},apad,atrim=0:{DUR}[c{i}]")
    fc.append("".join(f"[c{i}]" for i in range(len(chs))) + f"amix=inputs={len(chs)}:normalize=0[vo]")
    AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[vo]", "-c:a", "pcm_s24le", tmp("vo")])
    AK.run(["-stream_loop", "-1", "-i", music, "-af",
            f"aresample=48000,aformat=channel_layouts=stereo,atrim=0:{DUR},afade=t=in:d=0.5,afade=t=out:st={DUR - 2.5:.2f}:d=2.5",
            "-c:a", "pcm_s24le", tmp("mus")])
    ev = list(sfx)
    if ev:  # in batches: one ffmpeg graph with hundreds of inputs is slow
        parts = []
        for bi in range(0, len(ev), 40):
            fc, ins = [], []
            chunk = ev[bi:bi + 40]
            for n, (f, at, gain, maxlen) in enumerate(chunk):
                path = f if os.path.isabs(f) else os.path.join(AK.LIB, f)
                pk = AK.PEAK.get(f)
                if pk is None:
                    pk = kit.peak(path)
                    AK.PEAK[f] = pk
                start = at - pk
                ins += ["-i", path]
                chain = f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={max(0, -start):.4f}"
                if maxlen:
                    chain += f",afade=t=out:st={maxlen * .6:.3f}:d={maxlen * .4:.3f},atrim=0:{maxlen:.3f}"
                fc.append(chain + f",asetpts=PTS-STARTPTS,volume={gain}dB,adelay={int(max(0, start) * 1000)}:all=1,{AK.FILL},apad,atrim=0:{DUR}[x{n}]")
            fc.append("".join(f"[x{n}]" for n in range(len(chunk))) + f"amix=inputs={len(chunk)}:normalize=0[fx]")
            p = tmp(f"fx{bi}")
            AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[fx]", "-c:a", "pcm_s24le", p])
            parts.append(p)
        ins = sum((["-i", p] for p in parts), [])
        AK.run(ins + ["-filter_complex", "".join(f"[{i}:a]" for i in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0[fx]",
                      "-map", "[fx]", "-c:a", "pcm_s24le", tmp("fx")])
    gm = bed - AK.lufs(tmp("mus"))
    gv = -15.0 - AK.lufs(tmp("vo"))
    mixin = ["-i", tmp("vo"), "-i", tmp("mus")] + (["-i", tmp("fx")] if ev else [])
    fxs = "[2:a]volume=0dB[c];" if ev else ""
    amix = f"[a][b]{'[c]' if ev else ''}amix=inputs={3 if ev else 2}:normalize=0"
    AK.run(mixin + ["-filter_complex", f"[0:a]volume={gv:.2f}dB[a];[1:a]volume={gm:.2f}dB[b];{fxs}{amix},"
                    f"alimiter=limit=0.84:attack=3:release=60:level=disabled[o]", "-map", "[o]", "-c:a", "pcm_s24le", tmp("mix")])
    g = -14 - AK.lufs(tmp("mix"))
    out = os.path.join(here, "audio.wav")
    AK.run(["-i", tmp("mix"), "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled", "-c:a", "pcm_s16le", out])
    AK.run(["-i", out, "-c:a", "aac", "-b:a", "160k", os.path.join(here, name + ".m4a")])
    for f in os.listdir(here):
        if f.startswith("_") and f.endswith(".wav"):
            os.remove(os.path.join(here, f))
    print(f"audio: {DUR} s, voice {gv:+.1f} dB, music {gm:+.1f} dB")


def run(here, name, chapters, gaps, argv):
    steps = argv or ["voice", "timing"]
    if "voice" in steps:
        voice(here, chapters)
    if "timing" in steps:
        timing(here, chapters, gaps)
    if "audio" in steps:
        audio(here, name, page_sfx(here, name))
    if "stills" in steps:  # $env:STILLS="10,60,120"
        subprocess.run([os.path.join(kit.ROOT, "runtime", "python.exe"), os.path.join(kit.MOTION, "render.py"), os.path.join(here, name + ".html"),
                        os.path.join(here, "stills"), "--size", "1920x1080", "--stills", os.environ.get("STILLS", "5,60,200")], check=True)
    if "render" in steps:
        subprocess.run([os.path.join(kit.ROOT, "runtime", "python.exe"), os.path.join(kit.MOTION, "render.py"), os.path.join(here, name + ".html"),
                        os.path.join(here, "video.mp4"), "--size", "1920x1080", "--fps", "30", "--sub", "2", "--workers", os.environ.get("LK_WORKERS", "6"), "--crf", "18"], check=True)
        # 6 workers = one headless Edge + ffmpeg each; right for the Ryzen 5 1600 (6 cores / 12 threads, 16 GB)
    if "mux" in steps:
        kit.mux(here, "video.mp4", name, os.path.join(here, name + ".mp4"))
