r"""Go4Driver PAKIET 2 (2026-10-10): 6 rolek pod prośbę klienta (firmy = darmowe ogłoszenie, kierowcy -> „wyślij szefowi”,
szukający pracy, taxi + kurier). Montaż jak go4d8-go4d11 (lib/g4s.js), strona każdej rolki pisana ręcznie (<nazwa>.html).
USTA (od 2026-10-10): LatentSync ZAKAZANY (falujące usta). Stare postacie: krok kl = Kling LipSync tylko na wycinki z twarzą na JUŻ OPŁACONYM klipie z pakietu 1
(go4d4-go4d7) albo na zdjęciu nowej postaci (nano-banana-pro 0,15 $). Zero Kling Avatar. Notatka: wiedza/project-go4driver-klient.md
  ..\..\runtime\python.exe c4y\lib\g4p.py <go4d12|...|go4d17|all> voice img lips frames timing stills audio render send
  USTA NA WYCINKI (2026-10-10): g4p.py go4d14 kltest (1 wycinek próbny) | g4p.py go4d12 kl klframes stills audio render send
Kroki płatne: voice (kredyty ElevenLabs, cache), img (0,15 $), lips (0,20 $). Każdy płatny krok pomija się, gdy plik już jest.
"""
import json, os, subprocess, sys
LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
import c4ykit  # noqa: E402
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))
from g4d import SEB, MICHAL, MAGDA, OLA, STYLE, ffprobe_dur, _env  # noqa: E402

C4Y = c4ykit.C4Y
DINO = "DTZOFDiEo6RpVklQfFpj"    # Dino - Bartłomiej (młody, PL)
OSCAR = "04BD7Fenyf9Ysq983wrd"   # Oscar - Energetic & Direct (PL)
END = 2.0
MUSIC = os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_groove.mp3")
MUSIC_CALM = os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_calm.mp3")
OFFSET_EXTRA = 0.033

REELS = {
    # FIRMY 1 (spokojny): ogłoszenie za 0 zł, właściciel z go4d4
    "go4d12": dict(title="Dla firm: ogłoszenie za 0 zł (styl spokojny)", src="go4d4", voice=MICHAL, calm=True,
        lines=[("b1", "Płacisz za ogłoszenie, że szukasz kierowcy?"),
               ("b2", "A potem dzwonią wszyscy, tylko nie kierowcy."),
               ("b3", "Jest portal tylko dla kierowców i firm transportowych. Go For Driver."),
               ("b4", "Ogłoszenie dodajesz w kilka minut. I na razie za zero złotych."),
               ("b5", "Póki jest za darmo, wrzuć swoje.")],
        opis="Płacisz za ogłoszenie, a dzwonią wszyscy, tylko nie kierowcy? 🙄\nGo4Driver to portal tylko dla kierowców i firm transportowych. Ogłoszenie dodajesz w kilka minut, na razie za 0 zł.\nPóki jest za darmo, wrzuć swoje 👉 link w bio\n\n#firmatransportowa #transport #szukamkierowcy #kierowcaCE #rekrutacja #spedycja #go4driver"),
    # FIRMY 2 (spokojny): weekend w domu = Twój atut, właścicielka z go4d5
    "go4d13": dict(title="Dla firm: weekend w domu to Twój atut (styl spokojny)", src="go4d5", voice=MAGDA, calm=True,
        lines=[("b1", "Dajesz kierowcom weekend w domu?"),
               ("b2", "To twój najmocniejszy argument. A w zwykłym ogłoszeniu ginie gdzieś w opisie."),
               ("b3", "Na Go For Driver kierowca zaznacza jeden filtr: weekend w domu."),
               ("b4", "I widzi tylko takie oferty. Czyli twoją."),
               ("b5", "Dodaj ogłoszenie za darmo.")],
        opis="Dajesz kierowcom weekend w domu? To Twój najmocniejszy argument 🏠\nNa Go4Driver kierowca zaznacza jeden filtr „Weekend w domu” i widzi tylko takie oferty. Czyli Twoją.\nDodaj ogłoszenie za darmo 👉 link w bio\n\n#firmatransportowa #transport #szukamkierowcy #weekendwdomu #kierowcaCE #rekrutacja #go4driver"),
    # KIEROWCY -> SZEF 1 (dynamiczny): „wysłałem szefowi link”, kierowca z telefonem z go4d6
    "go4d14": dict(title="Dla kierowców: wyślij to szefowi (styl dynamiczny)", src="go4d6", voice=SEB,
        lines=[("b1", "Mój szef od dwóch miesięcy szuka kierowcy."),
               ("b2", "Dał ogłoszenie i dzwonili ludzie, którzy tira widzieli tylko w telewizji."),
               ("b3", "To mu wysłałem jeden link. Go For Driver, portal tylko dla kierowców."),
               ("b4", "Ogłoszenie dodaje za darmo i trafia prosto do kierowców."),
               ("b5", "Twój szef też szuka? Wyślij mu tę rolkę.")],
        opis="Twój szef też od miesięcy szuka kierowcy? 🚛\nGo4Driver to portal tylko dla kierowców i firm transportowych. Ogłoszenie dodaje za darmo.\nWyślij mu tę rolkę 📤\n\n#kierowca #kierowcaCE #pracadlakierowcy #szef #transport #kierowcazawodowy #go4driver"),
    # KIEROWCY -> SZEF 2 (dynamiczny, humor): „trasa za kolegę”, kierowczyni z go4d7
    "go4d15": dict(title="Dla kierowców: oznacz szefa (styl dynamiczny)", src="go4d7", voice=OLA,
        lines=[("b1", "Trzeci raz w tym miesiącu jadę trasę za kolegę."),
               ("b2", "Bo szef mówi, że nie ma ludzi."),
               ("b3", "Szefie, ludzie są. Tylko nie szukasz ich tam, gdzie sprzedają szafki na buty."),
               ("b4", "Kierowców szukaj na Go For Driver. A ogłoszenie jest za darmo."),
               ("b5", "Oznacz szefa. Ja chcę w weekend być w domu.")],
        opis="Trzeci raz w tym miesiącu trasa za kolegę, bo „nie ma ludzi” 🙃\nSzefie, kierowców szukaj tam, gdzie są kierowcy, a nie szafki na buty. Na Go4Driver ogłoszenie jest za darmo.\nOznacz szefa 👇\n\n#kierowczyni #kierowcaCE #pracadlakierowcy #szef #weekendwdomu #transport #go4driver"),
    # SZUKAJĄCY PRACY (dynamiczny): „masz prawo jazdy B? to masz zawód”, NOWA postać (próba ust na zdjęciu)
    "go4d16": dict(title="Dla szukających pracy: masz prawo jazdy B? (styl dynamiczny)", voice=DINO, kling="b2",
        img=("A 24-year-old Polish young man stands on a city sidewalk in a Polish town, filming himself with a phone held at arm's "
             "length like a vlog. Short dark-blond hair, light stubble, friendly slightly cheeky smile, gray hoodie under an open "
             "dark bomber jacket, a backpack strap on one shoulder. Behind him, out of focus: a tram stop, a row of apartment "
             "blocks, a plain white delivery van parked at the curb, overcast autumn daylight. " + STYLE),
        lines=[("b1", "Szukasz pracy, a masz prawo jazdy kategorii B?"),
               ("b2", "To już masz zawód. Kurier, taxi, dostawy, bus."),
               ("b3", "Na Go For Driver są tylko prace za kierownicą. I każde ogłoszenie ma podaną stawkę."),
               ("b4", "Załóż darmowe konto, a CV zrobi się samo z twojego profilu."),
               ("b5", "Go For Driver kropka com.")],
        opis="Szukasz pracy, a masz prawo jazdy kat. B? To już masz zawód 🚗\nKurier, taxi, dostawy, bus. Na Go4Driver są tylko prace za kierownicą, a każde ogłoszenie ma podaną stawkę.\nZałóż darmowe konto, CV zrobi się samo 👉 link w bio\n\n#praca #szukampracy #prawojazdy #kierowca #kurier #taxi #go4driver"),
    # TAXI + KURIER (dynamiczny): „też jesteś kierowcą”, NOWA postać
    "go4d17": dict(title="Taxi i kurierzy: też jesteś kierowcą (styl dynamiczny)", voice=OSCAR, kling="b2",
        img=("Front-facing vertical smartphone selfie photo taken INSIDE a car at dusk: the phone camera itself takes the photo, so no "
             "phone is visible. A 38-year-old Polish man sits in the driver's seat and looks straight into the lens, chest-up framing, "
             "his face large in the upper third of the frame. Short dark hair, neatly trimmed beard, black zip-up sweater, seatbelt "
             "across his chest, relaxed confident half-smile, mouth closed. Behind him: the driver's headrest and the side window "
             "with blurred orange city lights. Warm dashboard light on his face. We are inside the car: no door frame, no window "
             "glass and no side mirror in front of the face. Photorealistic, natural skin texture, slight phone-camera softness. "
             "No text, no logos, no taxi sign, no stickers, no watermark."),
        lines=[("b1", "Jeździsz taksówką na aplikacji albo rozwozisz paczki?"),
               ("b2", "To też jesteś kierowcą. Serio."),
               ("b3", "Na Go For Driver są nie tylko tiry. Jest taxi, kurier i dostawy jedzenia."),
               ("b4", "Wpisujesz swoje miasto i od razu widzisz stawkę."),
               ("b5", "Załóż darmowe konto na Go For Driver.")],
        opis="Jeździsz taxi na aplikacji albo rozwozisz paczki? To też jesteś kierowcą 🚕📦\nNa Go4Driver są nie tylko tiry: taxi, kurier, dostawy jedzenia. Wpisujesz miasto i od razu widzisz stawkę.\nZałóż darmowe konto 👉 link w bio\n\n#taxi #kurier #dostawy #kierowca #praca #szukampracy #go4driver"),
}


def d(name, *p):
    return os.path.join(C4Y, name, *p)


def voice(name):
    R = REELS[name]
    vo = d(name, "vo", "reel"); os.makedirs(vo, exist_ok=True)
    c4ykit.kit.tighten(vo, [t for _, t in R["lines"]], voice_id=R["voice"])
    open(d(name, "opis.txt"), "w", encoding="utf-8").write(R["opis"] + "\n")


def img(name):
    """nowa postać: 1 zdjęcie nano-banana-pro 2K (0,15 $), tylko gdy go jeszcze nie ma"""
    import falkit, urllib.request
    R = REELS[name]
    ai = d(name, "ai"); os.makedirs(ai, exist_ok=True)
    out = os.path.join(ai, "still.png")
    if not R.get("img") or os.path.exists(out):
        print("img: pomijam", name); return
    res = falkit.run("fal-ai/nano-banana-pro", {"prompt": R["img"], "num_images": 1, "aspect_ratio": "9:16",
                                                "resolution": "2K", "output_format": "png"})
    urllib.request.urlretrieve(res["images"][0]["url"], out)
    print("still:", out)


def lips(name):
    """nowe usta pod nowy głos: LatentSync (0,20 $ do 40 s) na opłaconym klipie postaci albo na zdjęciu (zamienionym lokalnie na wideo)"""
    import falkit
    R = REELS[name]
    ai = d(name, "ai"); os.makedirs(ai, exist_ok=True)
    out = os.path.join(ai, "lips.mp4")
    if os.path.exists(out):
        print("lips: już jest", out); return
    vo = os.path.join(d(name, "vo", "reel"), "voice_t.mp3")
    if R.get("kling"):  # decyzja 2026-10-10: nowa postać = Kling AI Avatar v2 STANDARD (0,0562 $/s) tylko na hook (głos do końca linii R["kling"])
        L = json.load(open(d(name, "vo", "reel", "lines.json"), encoding="utf-8"))
        keys = [k for k, _ in R["lines"]]
        cut = L[keys.index(R["kling"])]["end"] + .25
        av = os.path.join(d(name, "vo", "reel"), "voice_av.mp3")
        c4ykit.run(["-i", vo, "-t", f"{cut:.3f}", "-af", "afade=t=out:st=%.3f:d=0.08" % (cut - .08), "-c:a", "libmp3lame", "-q:a", "2", av])
        print(f"Kling Standard: {cut:.2f} s ≈ {cut * .0562:.2f} $")
        falkit.run("fal-ai/kling-video/ai-avatar/v2/standard",
                   {"image_url": falkit.host(os.path.join(ai, "still.png")), "audio_url": falkit.host(av),
                    "prompt": "A person talks to the phone camera with energy and a friendly smile, natural small head movements, blinking, "
                              "expressive eyebrows, realistic, the camera does not move. Clothing stays exactly as in the photo: plain fabric, "
                              "no text, no letters, no logos, no symbols appear on clothes or anywhere in the image."}, out)
        return
    if R.get("src") or not R.get("kling"):  # ZAKAZ LatentSync (2026-10-10): stare klipy -> krok kl (wycinki), nowe postacie -> kling
        sys.exit("ZAKAZ LatentSync: użyj kroku kl (usta Kling LipSync tylko na wycinki z twarzą), wiedza/feedback-usta-zakaz-latentsync.md")
    if R.get("src"):
        src = d(R["src"], "ai", "avatar.mp4")
    else:  # zdjęcie -> nieruchome wideo 1080x1920 na długość głosu (ruch kamery dokłada render, za darmo)
        src = os.path.join(ai, "still.mp4")
        c4ykit.run(["-loop", "1", "-i", os.path.join(ai, "still.png"), "-t", f"{ffprobe_dur(vo) + .3:.2f}", "-r", "30",
                    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p",
                    "-c:v", "libx264", "-crf", "16", src])
    src_v = os.path.join(ai, "src_noaudio.mp4")  # bez starego dźwięku (model dostaje tylko nowy głos)
    c4ykit.run(["-i", src, "-an", "-c:v", "copy", src_v])
    falkit.run("fal-ai/latentsync", {"video_url": falkit.host(src_v), "audio_url": falkit.host(vo), "loop_mode": "pingpong"}, out)


def frames(name):
    clip = name + "av"
    out = os.path.join(c4ykit.CLIPS, clip); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    c4ykit.run(["-i", d(name, "ai", "lips.mp4"), "-an", "-vf", "fps=30", "-q:v", "2", os.path.join(out, "%03d.jpg")])
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8")); man[clip] = len(os.listdir(out))
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")
    print(clip, man[clip], "klatek")


def offset(name):
    """o ile dźwięk w lips.mp4 jest później niż nasz głos (s), korelacja obwiedni co 10 ms"""
    a, b = _env(d(name, "vo", "reel", "voice_t.mp3")), _env(d(name, "ai", "lips.mp4"))
    n = min(len(a), len(b)); a, b = a[:n], b[:n]
    if n < 100 or not any(b):
        return 0.0
    ma, mb = sum(a) / n, sum(b) / n
    a = [x - ma for x in a]; b = [x - mb for x in b]
    best = max(range(-30, 31), key=lambda L: sum(a[i] * b[i + L] for i in range(max(0, -L), min(n, n - L))))
    return best / 100


def timing(name):
    R = REELS[name]
    L = json.load(open(d(name, "vo", "reel", "lines.json"), encoding="utf-8"))
    off = offset(name)
    delay = round(max(0.0, off) + OFFSET_EXTRA, 3)
    vend = ffprobe_dur(d(name, "ai", "lips.mp4"))
    T = {"DUR": round(L[-1]["end"] + delay + END, 2), "VEND": vend, "DELAY": delay, "OFFSET": off, "lines": []}
    for (k, _), l in zip(R["lines"], L):
        T["lines"].append({"key": k, "text": l["text"], "slot": round(l["start"] + delay, 3),
                           "words": [{"w": w["w"], "t": round(w["s"] + delay, 3), "e": round(w["e"] + delay, 3)} for w in l["words"]]})
    json.dump(T, open(d(name, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(d(name, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print(f"{name}: DUR {T['DUR']} s, usta {vend:.2f} s, przesunięcie {off * 1000:.0f} ms -> głos +{delay * 1000:.0f} ms")


def stills(name):
    T = json.load(open(d(name, "timing.json"), encoding="utf-8"))
    c4ykit.stills(d(name), name, [round(x * .5, 2) for x in range(int(T["DUR"] * 2) + 1)])


def audio(name):
    import mixkit
    R, T = REELS[name], json.load(open(d(name, "timing.json"), encoding="utf-8"))
    calm = R.get("calm")
    mixkit.mix(d(name), name, T["DUR"], R.get("music") or (MUSIC_CALM if calm else MUSIC),
               tracks=[(d(name, "vo", "reel", "voice_t.mp3"), T["DELAY"], 0, 0.0, None)], bed=-20.0 if calm else -17.0)


def send(name):
    R = REELS[name]
    subprocess.run([c4ykit.PY, os.path.join(c4ykit.ROOT, "tools", "realizacje", "realizacje.py"), "wyslij", "go4driver",
                    d(name, name + ".mp4"), "--tytul", R["title"], "--opis", d(name, "opis.txt")], check=True)


# ---- USTA TYLKO NA WYCINKI Z TWARZĄ (decyzja użytkownika 2026-10-10, wiedza/feedback-usta-zakaz-latentsync.md) ----
# czasy rolki [od, do] (s), gdy twarz jest w kadrze (+ zapas na przejście), min 2 s, max 10 s (wymóg Kling LipSync)
SEGS = {
    "go4d12": [(0, 2.0), (5.24, 8.18), (14.63, 16.63)],
    "go4d13": [(0, 3.80), (13.8, 15.8)],
    "go4d14": [(0, 2.74), (6.4, 8.4), (15.64, 18.14)],
    "go4d15": [(0, 2.0), (2.73, 6.94), (14.9, 16.9)],
}
KL_LIPSYNC = "fal-ai/kling-video/lipsync/audio-to-video"  # 0,014 $ za jednostkę (ok. 5 s), wideo 2-10 s 720p, audio min 2 s


def kl(name, only=None):
    """baza = oryginalny klip Kling postaci (bez LatentSync) w pingpongu na długość głosu; na wycinki z twarzą nowe usta Kling LipSync;
    klatki: cała baza -> clips/<nazwa>av, wycinki nadpisują swoje klatki. only = numer wycinka (próba jednego)"""
    import falkit
    R, T = REELS[name], json.load(open(d(name, "timing.json"), encoding="utf-8"))
    ai, kd = d(name, "ai"), d(name, "ai", "kl"); os.makedirs(kd, exist_ok=True)
    vo = d(name, "vo", "reel", "voice_t.mp3")
    D = ffprobe_dur(vo) + T["DELAY"] + .8
    base = os.path.join(ai, "base.mp4")
    if not os.path.exists(base):
        src = d(R["src"], "ai", "avatar.mp4")
        c4ykit.run(["-i", src, "-filter_complex", "[0:v]fps=30,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,loop=loop=3:size=32767:start=0[o]",
                    "-map", "[o]", "-t", f"{D:.2f}", "-an", "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", base])
    # głos na osi rolki (z przesunięciem DELAY), żeby wycinek audio = dokładnie to, co słychać pod tym kawałkiem obrazu
    vreel = os.path.join(kd, "voice_reel.wav")
    if not os.path.exists(vreel):
        ms = int(round(T["DELAY"] * 1000))
        c4ykit.run(["-i", vo, "-af", f"adelay={ms}|{ms},apad=pad_dur=2", "-ar", "44100", "-ac", "1", vreel])
    for i, (a, b) in enumerate(SEGS[name]):
        if only is not None and i != only:
            continue
        out = os.path.join(kd, f"seg{i}_ls.mp4")
        if os.path.exists(out):
            print("wycinek", i, "już jest"); continue
        sv, sa = os.path.join(kd, f"seg{i}.mp4"), os.path.join(kd, f"seg{i}.mp3")
        c4ykit.run(["-ss", f"{a:.3f}", "-i", base, "-t", f"{b - a:.3f}", "-an", "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", "-r", "30", sv])
        c4ykit.run(["-ss", f"{a:.3f}", "-i", vreel, "-t", f"{b - a:.3f}", "-c:a", "libmp3lame", "-q:a", "2", sa])
        print(f"Kling LipSync {name} wycinek {i}: {a:.2f}-{b:.2f} s ({b - a:.2f} s)", flush=True)
        falkit.run(KL_LIPSYNC, {"video_url": falkit.host(sv), "audio_url": falkit.host(sa)}, out)


def klframes(name):
    """klatki: baza (stary ruch, usta niewidoczne, bo poza wycinkami twarzy nie ma) + wycinki Kling LipSync na swoich miejscach"""
    import shutil
    clip = name + "av"; out = os.path.join(c4ykit.CLIPS, clip); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    c4ykit.run(["-i", d(name, "ai", "base.mp4"), "-an", "-vf", "fps=30", "-q:v", "2", os.path.join(out, "%03d.jpg")])
    n = len(os.listdir(out))
    kd = d(name, "ai", "kl")
    for i, (a, b) in enumerate(SEGS[name]):
        ls = os.path.join(kd, f"seg{i}_ls.mp4")
        if not os.path.exists(ls):
            print("BRAK wycinka", i); continue
        tmp = os.path.join(kd, f"f{i}"); shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
        c4ykit.run(["-i", ls, "-an", "-vf", "fps=30,scale=720:1280", "-q:v", "2", os.path.join(tmp, "%03d.jpg")])
        k0 = int(round(a * 30))
        fs = sorted(os.listdir(tmp))
        for k, f in enumerate(fs):
            if k0 + k < n:
                shutil.copyfile(os.path.join(tmp, f), os.path.join(out, f"{k0 + k + 1:03d}.jpg"))
        print(f"wycinek {i}: {len(fs)} klatek od {k0}")
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8")); man[clip] = n
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")
    T = json.load(open(d(name, "timing.json"), encoding="utf-8")); T["VEND"] = round(n / 30, 3)
    json.dump(T, open(d(name, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(d(name, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print(clip, n, "klatek, VEND", T["VEND"])


STEPS = {"voice": voice, "img": img, "lips": lips, "frames": frames, "timing": timing, "stills": stills, "audio": audio,
         "render": lambda n: c4ykit.render(d(n), n, workers=6), "send": send, "kl": kl, "klframes": klframes,
         "kltest": lambda n: kl(n, only=0)}

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    who, steps = sys.argv[1], sys.argv[2:]
    names = list(REELS) if who == "all" else who.split(",")
    for n in names:
        os.makedirs(d(n), exist_ok=True)
        for s in steps:
            print(f"== {n}: {s}", flush=True)
            STEPS[s](n)
