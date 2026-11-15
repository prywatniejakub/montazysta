r"""Clips4you KINO: filmowy wstęp AI (4-7 s) doklejany do gotowej rolki, wstawki w środku, samodzielne spoty.
Wiedza: wiedza/kino-hook-podrecznik.md + wiedza/research-filmowe-hooki-ai-2026-10.md, skill `kino-hook`.

W folderze projektu (motion/c4y/<nazwa>/) leży script.py z PLAN i `kino.main(HERE, PLAN)`:
  script.py wycena [768P|1080P]            ile kosztuje to, czego jeszcze nie ma (0 zł, nic nie generuje)
  script.py kadry --zgoda 0.19             zdjęcia kluczowe (Nano Banana 2.1), PŁATNE
  script.py arkusz                         arkusze kontrolne kadrów i klipów (0 zł)
  script.py ruch 768P --zgoda 0.53         ruch (H3 Max), PŁATNE; próba 768P, finał 1080P
  script.py plynnosc --zgoda 0.05          RIFE -> 60 kl./s (grosze), PŁATNE, opcjonalne
  script.py sklej                          montaż lokalny: nakładki, dźwięki, doklejenie do reklamy (0 zł)

TWARDA ZASADA: żaden płatny krok nie ruszy bez `--zgoda <kwota w $>` >= wycena. Kwotę wpisuje się dopiero po „tak”
użytkownika w czacie (wiedza/feedback-zero-wydatkow-bez-zgody.md). Istniejące pliki nigdy nie są generowane drugi raz.

PLAN (dict):
  name      nazwa pliku wynikowego
  look      blok stylu doklejany do każdego promptu zdjęcia
  frames    [{id, prompt, refs:[id | "plik:ścieżka"], res:"2K"} | {id, src:"plik:ścieżka"} | {id, src:"klatka:film.mp4@1.8"}]
  clips     [{id, first, last?, secs, prompt, mode:"i2v"|"ref", images:[...], audio:[...], speed:1.0, cut:(od, do)}]
  overlay   {call:"WŁAŚCICIELE FIRM", caps:[(t0, t1, "tekst z <b>żółtym</b>")], ai:[(t0, t1)]}   czasy na osi wstępu
  graft     {ad:"..\\ad9\\ad9.mp4", jcut:0.5, vol:0.8, sfx:[(t, "WH_SOFT", dB)], end:None | {t1:"Clips4you", t2:"Umów rozmowę"}}
"""
import base64, datetime, json, os, shutil, subprocess, sys, time, urllib.request

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
SFX = os.path.join(ROOT, "biblioteka", "Dźwięki")
LIB = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(ROOT, "motion", "kuba", "lib"), os.path.join(ROOT, "motion")]

IMG, EDIT = "google/nano-banana-2.1", "google/nano-banana-2.1/edit"
I2V, REF, RIFE = "minimax/h3-max/image-to-video", "minimax/h3-max/reference-to-video", "fal-ai/rife/video"
# ceny fal odczytane 2026-10-10 (wiedza/project-c4y-film-kinowy-ai.md); przed większym wydatkiem sprawdzić fal.ai/models/<id>/llms.txt
P_IMG = {"1K": .040, "2K": .059, "4K": .134}
P_EDIT = {"1K": .044, "2K": .063, "4K": .138}
P_I2V_PROMO, P_I2V = {"480P": .03, "768P": .048, "1080P": .096}, {"480P": .05, "768P": .08, "1080P": .16}
PROMO_END = datetime.date(2026, 10, 15)   # promocja -40% na H3 Max i2v do 15.10
P_REF = {"480P": .05, "768P": .08, "1080P": .16}
P_RIFE = .02                               # szacunek za klip (0,0013 $ za sekundę obliczeń)
USD = 3.9
RANK = ["1080P", "768P", "480P"]
SOUNDS = {"WH_SOFT": r"01 Whoosh/03 - Soft Whoosh.wav", "WH_SWING": r"01 Whoosh/02 - Swing Woosh.wav",
          "WH_SPAWN": r"01 Whoosh/05 - Spawn Whoosh.wav", "IMP_SOFT": r"02 Impact/06 - Soft Cinematic Impact.wav",
          "IMP_BASS": r"02 Impact/07 - Bass Cinematic Impact.wav", "RISER": r"03 Riser/11 - Short Aesthetic Riser.wav",
          "BOX": "02 Impact/08 - Whoosh Hit Faller.wav"}
PEAK = {"WH_SOFT": .34, "WH_SWING": .09, "WH_SPAWN": .63, "IMP_SOFT": .15, "IMP_BASS": .25, "RISER": 1.98, "BOX": .20}


def ff(args, cwd=None):
    r = subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error"] + args, cwd=cwd, capture_output=True, text=True, errors="ignore")
    if r.returncode:
        raise RuntimeError("ffmpeg: " + r.stderr[-1200:])


def dur(path):
    r = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True, errors="ignore").stderr
    h, m, s = r.split("Duration: ")[1].split(",")[0].split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def has_audio(path):
    return "Audio:" in subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True, errors="ignore").stderr


class K:
    def __init__(self, here, plan):
        self.here, self.p = here, plan
        self.meta_p = os.path.join(here, "kino.json")
        self.meta = json.load(open(self.meta_p, encoding="utf-8")) if os.path.exists(self.meta_p) else {"urls": {}, "koszty": []}

    def f(self, *a):
        return os.path.join(self.here, *a)

    def save(self):
        json.dump(self.meta, open(self.meta_p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    def spent(self, what, usd):
        self.meta["koszty"].append({"kiedy": time.strftime("%Y-%m-%d %H:%M"), "co": what, "usd": round(usd, 4)})
        self.save()

    # ---------- źródła obrazów ----------
    def local(self, ref):
        """ścieżka lokalnego pliku dla id kadru albo 'plik:...'"""
        if ref.startswith("plik:"):
            return os.path.normpath(os.path.join(self.here, ref[5:]))
        return self.f(ref + ".png")

    def pub(self, ref, host=False):
        """adres dla fal: adres z fal (kadr wygenerowany) albo plik lokalny jako data URI / hosting HeyGen"""
        u = self.meta["urls"].get(ref)
        if u and not host:
            return u
        path = self.local(ref)
        if host:
            import falkit
            return falkit.host(path)
        mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp3": "audio/mpeg", ".wav": "audio/wav"}[os.path.splitext(path)[1].lower()]
        return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode()

    def run(self, model, args, out=None, refkeys=()):
        """fal z awaryjnym hostingiem: gdy model odrzuci data URI (błąd walidacji = bez opłaty), podaje adresy z hostingu"""
        import falkit
        try:
            return falkit.run(model, args, out)
        except RuntimeError as e:
            if not any(c in str(e) for c in (" 422 ", " 400 ", "unprocessable", "Unprocessable")) or not refkeys:
                raise
            print("fal odrzucił dane wklejone w żądanie, próbuję przez hosting plików:", str(e)[:160])
            for key, ref in refkeys:
                val = [self.pub(r, host=True) for r in ref] if isinstance(ref, list) else self.pub(ref, host=True)
                args[key] = val
            return falkit.run(model, args, out)

    # ---------- wycena ----------
    def todo_frames(self):
        return [fr for fr in self.p.get("frames", []) if not os.path.exists(self.f(fr["id"] + ".png"))]

    def clip_file(self, c, res):
        return self.f(f"{c['id']}_{res}.mp4")

    def best(self, c):
        s = self.f(c["id"] + "_60.mp4")
        if os.path.exists(s):
            return s
        for r in RANK:
            if os.path.exists(self.clip_file(c, r)):
                return self.clip_file(c, r)
        return None

    def price_clip(self, c, res):
        if c.get("mode") == "ref":
            return P_REF[res] * c["secs"]
        return (P_I2V_PROMO if datetime.date.today() < PROMO_END else P_I2V)[res] * c["secs"]

    def wycena(self, res="768P", show=True):
        rows, tot = [], {"kadry": 0, "ruch": 0, "plynnosc": 0}
        for fr in self.todo_frames():
            if "src" in fr:
                continue
            usd = (P_EDIT if fr.get("refs") else P_IMG)[fr.get("res", "2K")]
            rows.append(("kadr " + fr["id"], usd)); tot["kadry"] += usd
        for c in self.p.get("clips", []):
            if not os.path.exists(self.clip_file(c, res)):
                usd = self.price_clip(c, res)
                rows.append((f"ruch {c['id']} {c['secs']} s {res}" + (" (z referencjami)" if c.get("mode") == "ref" else ""), usd)); tot["ruch"] += usd
            if not os.path.exists(self.f(c["id"] + "_60.mp4")):
                tot["plynnosc"] += P_RIFE
        if show:
            print(f"WYCENA {self.p['name']} (to, czego jeszcze nie ma; kurs {USD} zł/$):")
            for n, u in rows:
                print(f"  {n:<42} {u:6.3f} $  {u * USD:5.2f} zł")
            print(f"  RAZEM kadry {tot['kadry']:.2f} $ | ruch {res} {tot['ruch']:.2f} $ | płynność 60 kl./s ok. {tot['plynnosc']:.2f} $ (opcjonalnie)")
            done = sum(k["usd"] for k in self.meta["koszty"])
            print(f"  wydane dotąd w tym projekcie: {done:.2f} $ ({done * USD:.2f} zł)")
            if datetime.date.today() >= PROMO_END:
                print("  uwaga: promocja H3 Max skończyła się 15.10, liczę ceny regularne")
        return tot

    def gate(self, need, what):
        if need <= 0.0005:
            return
        a = sys.argv
        ok = float(a[a.index("--zgoda") + 1]) if "--zgoda" in a and a.index("--zgoda") + 1 < len(a) else -1
        if ok + 0.005 < need:
            sys.exit(f"STOP: {what} kosztuje {need:.2f} $ ({need * USD:.2f} zł). Najpierw wycena i wyraźne „tak” użytkownika w czacie, "
                     f"potem uruchom z  --zgoda {need:.2f}")

    # ---------- kadry ----------
    def kadry(self):
        self.gate(self.wycena(show=False)["kadry"], "kadry")
        for fr in self.p.get("frames", []):
            out = self.f(fr["id"] + ".png")
            if os.path.exists(out):
                continue
            if "src" in fr:  # kadr z pliku albo z klatki filmu (np. pierwsza klatka gotowej reklamy): 0 zł
                s = fr["src"]
                if s.startswith("klatka:"):
                    path, t = s[7:].rsplit("@", 1)
                    ff(["-ss", t, "-i", os.path.normpath(os.path.join(self.here, path)), "-frames:v", "1", out])
                else:
                    ff(["-i", self.local(s), "-frames:v", "1", out])
                print("kadr z pliku:", fr["id"]); continue
            res = fr.get("res", "2K")
            args = dict(prompt=fr["prompt"] + " " + self.p.get("look", ""), num_images=1, aspect_ratio=fr.get("ar", "9:16"), resolution=res, output_format="png")
            if fr.get("refs"):
                args["image_urls"] = [self.pub(r) for r in fr["refs"]]
                r = self.run(EDIT, args, refkeys=[("image_urls", fr["refs"])])
                self.spent("kadr " + fr["id"], P_EDIT[res])
            else:
                r = self.run(IMG, args)
                self.spent("kadr " + fr["id"], P_IMG[res])
            self.meta["urls"][fr["id"]] = r["images"][0]["url"]; self.save()
            urllib.request.urlretrieve(r["images"][0]["url"], out)
            print("kadr:", out)

    # ---------- ruch ----------
    def ruch(self, res):
        todo = [c for c in self.p.get("clips", []) if not os.path.exists(self.clip_file(c, res))]
        self.gate(sum(self.price_clip(c, res) for c in todo), f"ruch {res}")
        for c in todo:
            out = self.clip_file(c, res)
            args = dict(prompt=c["prompt"], duration=c["secs"], resolution=res, prompt_expansion_mode=c.get("expand", "disabled"))
            keys = []
            if c.get("first"):
                args["image_url"] = self.pub(c["first"]); keys.append(("image_url", c["first"]))
            if c.get("last"):
                args["end_image_url"] = self.pub(c["last"]); keys.append(("end_image_url", c["last"]))
            model = I2V
            if c.get("mode") == "ref":
                model = REF
                args["aspect_ratio"] = "9:16"
                if c.get("images"):
                    args["reference_image_urls"] = [self.pub(r) for r in c["images"]]; keys.append(("reference_image_urls", c["images"]))
                if c.get("audio"):
                    args["reference_audio_urls"] = [self.pub(r) for r in c["audio"]]; keys.append(("reference_audio_urls", c["audio"]))
            elif c.get("voice"):  # nasz gotowy głos jako ścieżka klipu (model dopasowuje obraz do dźwięku)
                args["target_audio_url"] = self.pub(c["voice"]); keys.append(("target_audio_url", c["voice"]))
            r = self.run(model, args, out, refkeys=keys)
            json.dump(r, open(out.replace(".mp4", ".json"), "w"), indent=1)
            self.spent(f"ruch {c['id']} {res}", self.price_clip(c, res))

    def plynnosc(self):
        import falkit
        todo = [c for c in self.p.get("clips", []) if self.best(c) and not os.path.exists(self.f(c["id"] + "_60.mp4"))]
        self.gate(P_RIFE * len(todo), "płynność (RIFE)")
        for c in todo:
            src, l120 = self.best(c), self.f(c["id"] + "_120.mp4")
            falkit.run(RIFE, {"video_url": falkit.host(src), "num_frames": 4, "use_scene_detection": False, "use_calculated_fps": True}, l120)
            ff(["-i", l120, "-i", src, "-map", "0:v", "-map", "1:a?", "-vf", "fps=60", "-c:v", "libx264", "-crf", "14", "-c:a", "copy", self.f(c["id"] + "_60.mp4")])
            self.spent("płynność " + c["id"], P_RIFE)

    # ---------- arkusze kontrolne ----------
    def arkusz(self):
        fr = [self.f(x["id"] + ".png") for x in self.p.get("frames", []) if os.path.exists(self.f(x["id"] + ".png"))]
        if fr:
            ins = sum((["-i", p] for p in fr), [])
            lay = "".join(f"[{i}:v]scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2[s{i}];" for i in range(len(fr)))
            ff(ins + ["-filter_complex", lay + "".join(f"[s{i}]" for i in range(len(fr))) + f"hstack=inputs={len(fr)}" if len(fr) > 1 else lay[:-1].replace("[s0]", ""),
                      "-frames:v", "1", self.f("arkusz_kadry.jpg")])
            print("arkusz_kadry.jpg:", " ".join(os.path.basename(p) for p in fr))
        for c in self.p.get("clips", []):
            b = self.best(c)
            if b:
                n = max(2, min(8, round(dur(b) * 1.5)))
                ff(["-i", b, "-vf", f"fps={n / dur(b):.4f},scale=300:-1,tile={n}x1", "-frames:v", "1", self.f(f"arkusz_{c['id']}.jpg")])
                print(f"arkusz_{c['id']}.jpg  ({os.path.basename(b)}, {dur(b):.2f} s)")

    # ---------- nakładki (HTML -> PNG przez Edge, styl reklam Clips4you) ----------
    def overlays(self, total):
        ov = self.p.get("overlay") or {}
        items = []  # (plik, t0, t1)
        css = open(os.path.join(LIB, "kino_overlay.css"), encoding="utf-8").read()
        jobs = []
        if ov.get("call"):
            jobs.append(("ov_call", f'<div class="callout">{ov["call"]}<svg viewBox="0 0 24 24"><path d="M12 4v15M5.5 12.5L12 19l6.5-6.5" fill="none" stroke="#111113" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>', 0, total))
        for i, (t0, t1, html) in enumerate(ov.get("caps", [])):
            jobs.append((f"ov_cap{i}", f'<div class="cap">{html}</div>', t0, t1))
        for i, (t0, t1) in enumerate(ov.get("ai", [])):
            jobs.append((f"ov_ai{i}", '<div class="aitag">AI</div>', t0, t1))
        if not jobs:
            return items
        import render
        render.W, render.H = 1080, 1920
        b = render.Browser(9391)
        try:
            b.call("Page.enable")
            b.call("Emulation.setDeviceMetricsOverride", width=1080, height=1920, deviceScaleFactor=1, mobile=False)
            b.call("Emulation.setDefaultBackgroundColorOverride", color={"r": 0, "g": 0, "b": 0, "a": 0})
            for name, html, t0, t1 in jobs:
                page = self.f(name + ".html")
                open(page, "w", encoding="utf-8").write(f"<!doctype html><meta charset='utf-8'><style>{css}</style><body>{html}"
                                                        "<script>document.fonts.ready.then(()=>{window.READY=true})</script>")
                b.call("Page.navigate", url="file:///" + page.replace("\\", "/"))
                for _ in range(200):
                    time.sleep(0.05)
                    try:
                        if b.js("window.READY === true"):
                            break
                    except Exception:
                        pass
                time.sleep(0.25)
                r = b.call("Page.captureScreenshot", format="png", clip={"x": 0, "y": 0, "width": 1080, "height": 1920, "scale": 1})
                open(self.f(name + ".png"), "wb").write(base64.b64decode(r["data"]))
                os.remove(page)
                items.append((self.f(name + ".png"), t0, t1))
        finally:
            b.close()
        return items

    # ---------- montaż ----------
    def sklej(self):
        g = self.p.get("graft") or {}
        tmp = self.f("_tmp"); os.makedirs(tmp, exist_ok=True)
        parts, ins_clips = [], {}
        for c in self.p["clips"]:
            src = self.best(c)
            if not src:
                sys.exit(f"brak klipu {c['id']} (najpierw `ruch`)")
            a, b = c.get("cut", (0, dur(src))); sp = c.get("speed", 1.0)
            out = os.path.join(tmp, c["id"] + ".mp4")
            vf = f"trim={a}:{b},setpts=(PTS-STARTPTS)/{sp},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=60,format=yuv420p"
            af = f"atrim={a}:{b},asetpts=PTS-STARTPTS,atempo={sp},aresample=48000" if has_audio(src) else None
            cmd = ["-i", src] + ([] if af else ["-f", "lavfi", "-t", f"{(b - a) / sp:.3f}", "-i", "anullsrc=r=48000:cl=stereo"])
            cmd += ["-filter_complex", f"[0:v]{vf}[v]" + (f";[0:a]{af}[a]" if af else ""), "-map", "[v]", "-map", "[a]" if af else "1:a",
                    "-c:v", "libx264", "-crf", "14", "-c:a", "pcm_s16le", "-shortest", out.replace(".mp4", ".mov")]
            ff(cmd)
            if c.get("role") == "insert":   # wstawka w środku reklamy: nie wchodzi do wstępu
                ins_clips[c["id"]] = out.replace(".mp4", ".mov")
            else:
                parts.append(out.replace(".mp4", ".mov"))
        hook, th = None, 0.0
        if parts:   # bez klipów wstępu = sama wstawka w środku reklamy
            open(os.path.join(tmp, "hook.txt"), "w", encoding="utf-8").write("".join(f"file '{os.path.basename(p)}'\n" for p in parts))
            hook = os.path.join(tmp, "hook.mov")
            ff(["-f", "concat", "-safe", "0", "-i", "hook.txt", "-c", "copy", "hook.mov"], cwd=tmp)
            th = dur(hook)

        ad = os.path.normpath(os.path.join(self.here, g["ad"])) if g.get("ad") else None
        if not hook and not ad:
            sys.exit("brak klipów wstępu i brak reklamy: nie ma czego składać")
        j = g.get("jcut", 0.0) if ad and hook else 0.0
        # wstawki: (id klipu, sekunda REKLAMY). Obraz reklamy jest na ten czas zastąpiony klipem, głos reklamy leci dalej.
        wst = [(ins_clips[w["clip"]], th - j + w["at"], dur(ins_clips[w["clip"]]), w.get("vol", -16)) for w in g.get("inserts", [])] if ad else []
        ov = dict(self.p.get("overlay") or {})
        ov["ai"] = list(ov.get("ai", [])) + [(t, t + d) for _, t, d, _ in wst]      # kółko AI także na wstawkach z postacią
        self.p["overlay"] = ov
        if not hook:
            ov.pop("call", None); ov["caps"] = []
        ovs = self.overlays(th)
        ins, fc, mix = (["-i", hook] if hook else []), [], []
        v, ai = "[0:v]", None
        if ad:
            ai = len(ins) // 2; ins += ["-i", ad]
            fc.append(f"[{ai}:v]trim=start={j},setpts=PTS-STARTPTS,scale=1080:1920,fps=60,format=yuv420p[adv]")
            if hook:
                fc.append("[0:v][adv]concat=n=2:v=1:a=0[cat]"); v = "[cat]"
            else:
                v = "[adv]"
        for k, (path, t, d, db) in enumerate(wst):
            i = len(ins) // 2; ins += ["-i", path]
            fc.append(f"[{i}:v]setpts=PTS-STARTPTS+{t:.3f}/TB[w{k}]")
            fc.append(f"{v}[w{k}]overlay=0:0:enable='between(t,{t:.3f},{t + d:.3f})':eof_action=pass[wv{k}]"); v = f"[wv{k}]"
            fc.append(f"[{i}:a]volume={db}dB,afade=t=in:d=0.1,afade=t=out:st={max(0, d - 0.15):.3f}:d=0.15,adelay={int(t * 1000)}:all=1[wa{k}]"); mix.append(f"[wa{k}]")
        for k, (png, t0, t1) in enumerate(ovs):
            i = len(ins) // 2; ins += ["-i", png]
            fc.append(f"{v}[{i}:v]overlay=0:0:enable='between(t,{t0:.3f},{t1:.3f})'[o{k}]"); v = f"[o{k}]"
        fc.append(f"{v}null[vout]")
        # dźwięk: wstęp (ściszony na końcu) + reklama od th - jcut (J-cut: głos reklamy wchodzi, zanim wejdzie jej obraz)
        vol, fade = g.get("vol", 0.8), max(0.25, j + 0.2)
        if hook:
            fc.append(f"[0:a]volume={vol},afade=t=out:st={max(0, th - fade):.3f}:d={fade:.3f},apad[ha]")
            mix.insert(0, "[ha]")
        if ad:
            fc.append(f"[{ai}:a]aresample=48000,adelay={int((th - j) * 1000)}:all=1[aa]"); mix.append("[aa]")
        sfx = list(g.get("sfx", [])) + [(t, "WH_SOFT", -9) for _, t, _, _ in wst] + [(t + d, "WH_SOFT", -11) for _, t, d, _ in wst]
        for k, s in enumerate(sfx):
            t, name = s[0], s[1]; db = s[2] if len(s) > 2 else -8
            i = len(ins) // 2; ins += ["-i", os.path.join(SFX, SOUNDS[name])]
            fc.append(f"[{i}:a]aresample=48000,volume={db}dB,adelay={int(max(0, t - PEAK[name]) * 1000)}:all=1[s{k}]"); mix.append(f"[s{k}]")
        total = th + (dur(ad) - j if ad else 0)
        fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{total:.3f},alimiter=limit=0.95[aout]")
        out = self.f(self.p["name"] + ".mp4")
        ff(ins + ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]", "-t", f"{total:.3f}", "-r", "60",
                  "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
        ff(["-i", out, "-frames:v", "1", "-q:v", "2", self.f("f0.jpg")])
        shutil.rmtree(tmp, ignore_errors=True)
        print(f"{os.path.basename(out)}: {dur(out):.2f} s (wstęp {th:.2f} s" + (f", reklama od {j:.2f} s" if ad else "") + "), klatka 0 w f0.jpg")


def main(here, plan):
    k, a = K(here, plan), sys.argv[1:]
    step = a[0] if a else "wycena"
    res = next((x for x in a if x in RANK), "768P")
    if step == "wycena":
        k.wycena(res)
    elif step == "kadry":
        k.kadry()
    elif step == "ruch":
        k.ruch(res)
    elif step == "plynnosc":
        k.plynnosc()
    elif step == "arkusz":
        k.arkusz()
    elif step == "sklej":
        k.sklej()
    else:
        sys.exit(__doc__)
