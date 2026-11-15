r"""Go4Driver go4d8 = rolka-wzór NOWEGO STYLU (2026-10-05, po ocenie pakietu 1: „zacina się, mało dynamiczne, jedno kopyto”).
Historia „szafka na buty” (głos i usta z go4d4, bez nowych ust), ale montaż: cięcia co 1-2 s, plan szeroki / zbliżenie,
ogłoszenia jak z portalu ogłoszeniowego, dzwoniący telefon, PRAWDZIWA strona go4driver.com przewijana z palcem,
nowa rytmiczna muzyka. Postać tylko tam, gdzie ma ruch (zero zamrożonych klatek). Zasady: wiedza/feedback-c4y-rolki-klientow-montaz.md
  ..\..\..\runtime\python.exe script.py assets timing page stills audio render
"""
import json, os, shutil, subprocess, sys, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit  # noqa: E402
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))
NAME = "go4d8"
SRC = os.path.join(HERE, "..", "go4d4")   # głos, oś i usta właściciela firmy
END = 1.9
MUSIC = ("Modern upbeat social media ad background track, punchy hip-hop drums with crisp claps, groovy funky bass line, "
         "short plucky synth stabs, confident and playful, 100 BPM, steady energy from the first second, no vocals, clean mix")
PHOTO = "Amateur smartphone photo for an online classifieds listing, realistic, slightly crooked framing, natural light, no text, no watermark, no logos. "
PHOTOS = {
    "szafka": PHOTO + "A white two-door shoe cabinet with a few pairs of shoes on top, standing in a narrow Polish apartment hallway with laminate floor.",
    "wozek": PHOTO + "A used gray baby stroller standing in a Polish apartment block stairwell next to a radiator.",
    "tir": PHOTO + "A white European semi-truck with a gray curtain-side trailer parked on a gravel company yard, overcast sky, photographed from the side-front.",
}


def assets():
    import falkit
    k = c4ykit.kit
    os.makedirs(os.path.join(HERE, "img"), exist_ok=True)
    for n, p in PHOTOS.items():
        out = os.path.join(HERE, "img", n + ".jpg")
        if os.path.exists(out):
            continue
        res = falkit.run("fal-ai/nano-banana-pro", {"prompt": p, "num_images": 1, "aspect_ratio": "4:3", "resolution": "1K", "output_format": "jpeg"})
        urllib.request.urlretrieve(res["images"][0]["url"], out); print("img", out)
    print(k.music("g4d_groove", MUSIC, 24))
    print(k.sound("phone_ring", "A modern smartphone ringing with vibration buzz on a wooden table, two short rings, close, no background noise", 2.2))


def timing():
    """oś z go4d4 (głos przesunięty pod usta), krótsza plansza końcowa"""
    T = json.load(open(os.path.join(SRC, "timing.json"), encoding="utf-8"))
    last = T["lines"][-1]["words"][-1]["e"]
    T["DUR"] = round(last + END, 2)
    json.dump(T, open(os.path.join(HERE, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(HERE, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print("DUR", T["DUR"], "VEND", T["VEND"])


if __name__ == "__main__":
    a = sys.argv[1:]
    if "assets" in a: assets()
    if "timing" in a: timing()
    if "stills" in a:
        T = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8"))
        c4ykit.stills(HERE, NAME, [round(x * .5, 2) for x in range(int(T["DUR"] * 2) + 1)])
    if "audio" in a:
        import mixkit
        T = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8"))
        mixkit.mix(HERE, NAME, T["DUR"], os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_groove.mp3"),
                   tracks=[(os.path.join(SRC, "vo", "reel", "voice_t.mp3"), T["DELAY"], 0, 0.0, None)], bed=-17.0)
    if "render" in a: c4ykit.render(HERE, NAME, workers=6)
