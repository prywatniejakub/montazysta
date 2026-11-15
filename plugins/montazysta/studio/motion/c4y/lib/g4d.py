r"""Rolki dla klienta Go4Driver (pakiet 1, 2026-10-05): stała postać AI = 1 zdjęcie (fal nano-banana-pro) + usta pod głos
(fal Kling AI Avatar v2 standard), ostatnie zdanie (wezwanie) z offu nad kartą Go4Driver, plansza końcowa.
Tanio: bez generowania wideo, ~1 $ na rolkę. Brief: wiedza/project-go4driver-klient.md.

  ..\..\runtime\python.exe c4y\lib\g4d.py <go4d4|go4d5|go4d6|go4d7|all> voice img avatar frames timing page audio stills render send

Każda rolka = folder motion/c4y/<nazwa>/ (strona <nazwa>.html z silnika lib/g4d.js + konfiguracja z REELS niżej).
Usta: Kling oddaje dźwięk ~30 ms później niż nasz głos, a widz lepiej znosi głos minimalnie po ustach niż przed,
więc głos kładziemy z przesunięciem zmierzonym na rolce + 1 klatka (OFFSET_EXTRA).
"""
import json, os, re, shutil, struct, subprocess, sys
LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
import c4ykit  # noqa: E402
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))

C4Y = c4ykit.C4Y
OFFSET_EXTRA = 0.033
END = 2.4  # plansza końcowa po głosie

# głosy ElevenLabs (biblioteka, polskie)
SEB = "2KHmTvaSfnESbNOrjPlk"      # Sebastian, kierowca z próbki go4d2 (klient go zna)
MICHAL = "ynIo8Bwfrnj9CiMSjKZM"   # Michał - Deep, Raspy, and Friendly
MAGDA = "fEfGdiGJK4l3imI70mtC"    # Magdalena - Warm, Low-Pitched and Lively
OLA = "8EWWaNTDrqObI22Gvo1q"      # Aleksandra - Urgent and Inviting (młoda)

STYLE = ("Vertical smartphone video still, phone mounted in front of the person filming like a vlog. Looking straight into the "
         "camera, mouth closed, relaxed, chest-up framing, face in the upper third of the frame. Photorealistic, natural skin "
         "texture, slight phone-camera softness. No text, no logos, no watermark, no brand names on vehicles.")

REELS = {
    # FIRMY 1: „szafki na buty” (właściciel firmy transportowej)
    "go4d4": dict(
        title="Szukasz kierowcy na OLX?", side="firmy", voice=MICHAL, hook="Szukasz kierowcy? 🚛",
        img=("A 56-year-old Polish owner of a small trucking company stands in his company yard. Gray short hair, gray mustache, "
             "weathered friendly face, slightly amused, navy fleece jacket with a small reflective stripe, a phone in one hand at "
             "his side. Behind him, out of focus: three parked European semi-trucks with curtain-side trailers, a small office "
             "container, overcast autumn daylight. " + STYLE),
        lines=[("b1", "Szukałem kierowcy na OLX."),
               ("b2", "Ogłoszenie wisiało między szafką na buty a wózkiem."),
               ("b3", "Zadzwonił jeden. Pytał, czy szafka jeszcze aktualna."),
               ("b4", "Kierowców nie szuka się wśród mebli."),
               ("b5", "Go For Driver to portal tylko dla kierowców i firm transportowych."),
               ("b6", "Dodaj ofertę za darmo, póki portal jest darmowy.")],
        split={"b1": [2, 2], "b2": [2, 2, 2, 1], "b3": [2, 1, 2, 2], "b4": [2, 2, 2], "b5": [1, 3, 2, 3]},
        keys=["olx", "szafka", "szafke", "butow", "buty", "wozkiem", "szafka", "mebli", "kierowcow"],
        emo=[("b2", "szafk", "👟"), ("b2", "wózk", "🛒"), ("b3", "szafka", "🤦")],
        rim=("b3", "aktualna"), punch=[("b3", "Pytał"), ("b4", "Kierowców")],
        card="add", card_at=("b5", 0), cta="Dodaj ofertę za darmo", sub="Portal pracy tylko dla kierowców<br>i firm transportowych."),
    # FIRMY 2: „gruszki” (właścicielka firmy z betoniarkami), dopasowanie do typu auta
    "go4d5": dict(
        title="Kierowca na betoniarkę", side="firmy", voice=MAGDA, hook="Masz betoniarki? 👀",
        img=("A 46-year-old Polish woman, owner of a concrete transport company, stands outdoors at her company base. Dark blonde "
             "hair in a low ponytail, confident warm smile hinting at a joke, dark softshell jacket over a white shirt, safety "
             "helmet held under her arm. Behind her, out of focus: a row of three white concrete mixer trucks, gravel yard, "
             "cloudy daylight. " + STYLE),
        lines=[("b1", "Mam dwanaście gruszek. Betoniarek."),
               ("b2", "Dałam ogłoszenie na dużym portalu."),
               ("b3", "Dzwonił kierowca autobusu, taksówkarz i pan od wózka widłowego."),
               ("b4", "A ja potrzebuję kierowcy na betoniarkę."),
               ("b5", "Na Go For Driver kierowca szuka po typie auta. Nawet po marce."),
               ("b6", "Dodaj ofertę za darmo i trafiaj do właściwych kierowców.")],
        split={"b1": [3, 1], "b2": [2, 3], "b3": [3, 1, 2, 3], "b4": [3, 2], "b5": [3, 2, 2, 3]},
        keys=["gruszek", "betoniarek", "autobusu", "taksowkarz", "widlowego", "betoniarke", "typie", "marce"],
        emo=[("b3", "autobus", "🚌"), ("b3", "taksów", "🚕"), ("b3", "widłow", "🏗️")],
        rim=("b3", "widłowego"), punch=[("b1", "Betoniarek"), ("b4", "betoniarkę")],
        card="filter", card_at=("b5", 0), cta="Dodaj ofertę za darmo", sub="Kierowca szuka po typie auta.<br>Twoja oferta trafia do właściwych.",
        # Kling wypalił fałszywe „napisy” na kurtce (2 razy, to samo miejsce): łatka z czystej klatki 3 s
        patch=dict(src=90, x=270, y=1440, w=540, h=120, f=28)),
    # KIEROWCY 1: „zadzwoń, to się dowiesz” (kierowca z próbki go4d2, nowa scena)
    "go4d6": dict(
        title="Zadzwoń, to się dowiesz", side="kierowcy", voice=SEB, hook="Oferta pracy dla kierowcy 🙄",
        ref=os.path.join(C4Y, "go4d2", "ai", "still_c.png"),
        img=("Same man, same face, same hair and stubble as in the reference photo. Now it is early evening, he sits in the driver's "
             "seat of his truck cab at a rest area, warm cab light, holding a smartphone in one hand slightly lowered, a skeptical "
             "raised eyebrow and a tired half-smile. Navy hoodie, orange high-visibility vest. Behind him the sleeper bunk "
             "curtain, through the window blurred truck lights at dusk. " + STYLE),
        lines=[("b1", "Ogłoszenie: kierowca C plus E. Super warunki."),
               ("b2", "Wynagrodzenie? Zadzwoń, to się dowiesz."),
               ("b3", "Zadzwoniłem. Pół godziny gadania."),
               ("b4", "A stawka jak z dwa tysiące dziesiątego."),
               ("b5", "Na Go For Driver każda oferta ma kwotę albo widełki."),
               ("b6", "Załóż darmowe konto i nie dzwoń w ciemno.")],
        split={"b1": [1, 2, 2, 2], "b2": [1, 1, 3], "b3": [1, 3], "b4": [3, 4], "b5": [3, 2, 1, 2, 2]},
        keys=["super", "warunki", "zadzwon", "dowiesz", "pol", "godziny", "dziesiatego", "kwote", "widelki"],
        emo=[("b2", "Zadzwoń", "📞"), ("b4", "dziesiątego", "🦖")],
        rim=("b4", "dziesiątego"), punch=[("b2", "Zadzwoń"), ("b4", "stawka")],
        card="offer", card_at=("b5", 0), cta="Załóż darmowe konto", sub="Każda oferta z kwotą albo widełkami.<br>Bez dzwonienia w ciemno."),
    # KIEROWCY 2: darmowe CV (młoda kierowczyni, chłodnia)
    "go4d7": dict(
        title="Szef pyta: masz CV?", side="kierowcy", voice=OLA, hook="Szef: masz CV? 😳",
        img=("A 28-year-old Polish woman truck driver sits in the driver's seat of a modern European truck cab, phone mounted "
             "on the dashboard filming her. Dark hair in a messy bun, light freckles, small silver earrings, playful slightly "
             "ironic expression, black hoodie under an unzipped dark green work jacket. Behind her the sleeper bunk with a folded "
             "blanket, through the side window a refrigerated trailer of another truck at a loading dock, soft morning light. "
             + STYLE),
        lines=[("b1", "Szef pyta: masz CV?"),
               ("b2", "Jakie CV? Mam C plus E i pięć lat w trasie."),
               ("b3", "Worda ostatnio otwierałam w szkole."),
               ("b4", "Na Go For Driver uzupełniasz profil, a CV robi się samo."),
               ("b5", "Załóż darmowe konto. CV masz od ręki.")],
        split={"b1": [2, 2], "b2": [2, 3, 1, 3], "b3": [1, 2, 2], "b4": [2, 2, 3, 2]},
        keys=["cv", "piec", "lat", "trasie", "worda", "szkole", "samo"],
        emo=[("b3", "Worda", "🖨️"), ("b3", "szkole", "🎒")],
        rim=("b3", "szkole"), punch=[("b2", "Jakie"), ("b3", "Worda")],
        card="cv", card_at=("b4", 0), cta="Załóż darmowe konto", sub="Darmowe CV z Twojego profilu.<br>Bez Worda i bez PDF-ów."),
}


def d(name, *p):
    return os.path.join(C4Y, name, *p)


def ffprobe_dur(path):
    return float(subprocess.run([c4ykit.FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip())


def voice(name):
    R = REELS[name]
    vo = d(name, "vo", "reel"); os.makedirs(vo, exist_ok=True)
    c4ykit.kit.tighten(vo, [t for _, t in R["lines"]], voice_id=R["voice"])


def img(name):
    import falkit, urllib.request
    R = REELS[name]
    ai = d(name, "ai"); os.makedirs(ai, exist_ok=True)
    if R.get("ref"):
        res = falkit.run("fal-ai/nano-banana-pro/edit", {"prompt": R["img"], "image_urls": [falkit.host(R["ref"])], "num_images": 1,
                                                         "aspect_ratio": "9:16", "resolution": "2K", "output_format": "png"})
    else:
        res = falkit.run("fal-ai/nano-banana-pro", {"prompt": R["img"], "num_images": 1, "aspect_ratio": "9:16",
                                                    "resolution": "2K", "output_format": "png"})
    urllib.request.urlretrieve(res["images"][0]["url"], os.path.join(ai, "still.png"))
    print("still:", os.path.join(ai, "still.png"))


def cta_start(name):
    L = json.load(open(d(name, "vo", "reel", "lines.json"), encoding="utf-8"))
    return L[-1]["start"], L[-2]["end"]


def avatar(name):
    """głos bez ostatniego zdania (wezwanie idzie z offu nad kartą) -> usta na zdjęciu"""
    import falkit
    vo = d(name, "vo", "reel")
    cta, prev_end = cta_start(name)
    cut = min(cta, prev_end + .25)
    c4ykit.run(["-i", os.path.join(vo, "voice_t.mp3"), "-t", f"{cut:.3f}", "-af", "afade=t=out:st=%.3f:d=0.08" % (cut - .08),
                "-c:a", "libmp3lame", "-q:a", "2", os.path.join(vo, "voice_av.mp3")])
    falkit.run("fal-ai/kling-video/ai-avatar/v2/standard",
               {"image_url": falkit.host(d(name, "ai", "still.png")), "audio_url": falkit.host(os.path.join(vo, "voice_av.mp3")),
                "prompt": "A person tells a short funny story to the phone camera, natural small head movements, blinking, "
                          "expressive eyebrows, slight smile at the punchline, realistic, the camera does not move. Clothing stays exactly as in the photo: plain fabric, no text, no letters, no logos, no symbols appear on clothes."},
               d(name, "ai", "avatar.mp4"))


def _env(path, rate=8000, hop=80):
    raw = subprocess.run([c4ykit.FF, "-v", "error", "-i", path, "-ac", "1", "-ar", str(rate), "-f", "s16le", "-"], capture_output=True).stdout
    s = struct.unpack(f"<{len(raw) // 2}h", raw)
    return [sum(abs(x) for x in s[i:i + hop]) / hop for i in range(0, len(s) - hop, hop)]


def offset(name):
    """o ile dźwięk w avatar.mp4 jest później niż nasz głos (s), korelacja obwiedni co 10 ms"""
    a, b = _env(d(name, "vo", "reel", "voice_av.mp3")), _env(d(name, "ai", "avatar.mp4"))
    n = min(len(a), len(b)); a, b = a[:n], b[:n]
    ma, mb = sum(a) / n, sum(b) / n
    a = [x - ma for x in a]; b = [x - mb for x in b]
    best = max(range(-30, 31), key=lambda L: sum(a[i] * b[i + L] for i in range(max(0, -L), min(n, n - L))))
    return best / 100


def frames(name):
    clip = name + "av"
    out = os.path.join(c4ykit.CLIPS, clip); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    c4ykit.run(["-i", d(name, "ai", "avatar.mp4"), "-an", "-vf", "fps=30", "-q:v", "2", os.path.join(out, "%03d.jpg")])
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8")); man[clip] = len(os.listdir(out))
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")
    print(clip, man[clip], "klatek")


def timing(name):
    """oś = nasz głos przesunięty o DELAY (usta z avatara zostają na swoich czasach)"""
    R = REELS[name]
    L = json.load(open(d(name, "vo", "reel", "lines.json"), encoding="utf-8"))
    off = offset(name)
    delay = round(max(0.0, off) + OFFSET_EXTRA, 3)
    vend = ffprobe_dur(d(name, "ai", "avatar.mp4"))
    voice_end = L[-1]["end"] + delay
    T = {"DUR": round(voice_end + END, 2), "VEND": vend, "DELAY": delay, "OFFSET": off, "lines": []}
    for (k, _), l in zip(R["lines"], L):
        T["lines"].append({"key": k, "text": l["text"], "slot": round(l["start"] + delay, 3),
                           "words": [{"w": w["w"], "t": round(w["s"] + delay, 3), "e": round(w["e"] + delay, 3)} for w in l["words"]]})
    json.dump(T, open(d(name, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(d(name, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print(f"{name}: DUR {T['DUR']} s, avatar {vend:.2f} s, przesunięcie Klinga {off * 1000:.0f} ms -> głos +{delay * 1000:.0f} ms")


def page(name):
    R = REELS[name]
    cfg = {k: R[k] for k in ("title", "side", "hook", "split", "keys", "emo", "rim", "punch", "card", "card_at", "cta", "sub")}
    cfg["patch"] = R.get("patch")
    cfg["clip"] = name + "av"
    html = f"""<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>{name} · {R['title']} (Go4Driver)</title>
<link rel="stylesheet" href="../lib/c4y.css">
<link rel="stylesheet" href="../lib/g4d.css">
</head>
<body>
<script src="../clips/manifest.js"></script>
<script src="timing.js"></script>
<script src="../lib/c4y.js"></script>
<script>window.G4D = {json.dumps(cfg, ensure_ascii=False)};</script>
<script src="../lib/g4d.js"></script>
<script>boot("{name}.m4a");</script>
</body>
</html>
"""
    open(d(name, name + ".html"), "w", encoding="utf-8").write(html)
    print("page:", d(name, name + ".html"))


def audio(name):
    import mixkit
    T = json.load(open(d(name, "timing.json"), encoding="utf-8"))
    mixkit.mix(d(name), name, T["DUR"], os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_road_guitar.mp3"),
               tracks=[(d(name, "vo", "reel", "voice_t.mp3"), T["DELAY"], 0, 0.0, None)], bed=-19.0)


def stills(name):
    T = json.load(open(d(name, "timing.json"), encoding="utf-8"))
    ts = [0, .5] + [l["slot"] + .4 for l in T["lines"]] + [T["VEND"] + .6, T["DUR"] - .3]
    c4ykit.stills(d(name), name, sorted(set(round(t, 2) for t in ts)))


def send(name):
    """do grupy Realizacje (akceptacja), przez tools/realizacje/realizacje.py"""
    R = REELS[name]
    opis = d(name, "opis.txt")
    subprocess.run([c4ykit.PY, os.path.join(c4ykit.ROOT, "tools", "realizacje", "realizacje.py"), "wyslij", "go4driver",
                    d(name, name + ".mp4"), "--tytul", R["title"], "--opis", opis], check=True)


STEPS = {"voice": voice, "img": img, "avatar": avatar, "frames": frames, "timing": timing, "page": page, "audio": audio,
         "stills": stills, "render": lambda n: c4ykit.render(d(n), n, workers=4), "send": send}

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    who, steps = sys.argv[1], sys.argv[2:]
    names = list(REELS) if who == "all" else who.split(",")
    for n in names:
        os.makedirs(d(n), exist_ok=True)
        for s in steps:
            print(f"== {n}: {s}", flush=True)
            STEPS[s](n)
