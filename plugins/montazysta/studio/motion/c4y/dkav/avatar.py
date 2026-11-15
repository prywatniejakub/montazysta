r"""Dobre Krzesła: awatarka UGC AI w hooku 3 rolek (prośba Pawła 2026-10-06, przed płatnością). Jedna kobieta, 3 miejsca z ICH materiałów:
dk1 = bordowy hoker w ich showroomie (IG Ddq2abhudnU), dk2 = fotel Tulip w kolorowym salonie (fp9YoSKPY_I), dk3 = krzesło Westa przy białym stole (_zD8i8ffiLw).
Zdjęcia: fal nano-banana-pro/edit (tło = ich kadr, scena 2 i 3 z referencją twarzy ze sceny 1). Usta: fal Kling AI Avatar v2 PRO pod pierwsze zdanie (b1).
  ..\..\..\runtime\python.exe avatar.py img1        -> ai/dk1.png   (potem img23 -> ai/dk2.png, ai/dk3.png)
  ..\..\..\runtime\python.exe avatar.py lips dk1 dk2 dk3   -> ai/<r>_av.mp4 (hook) + offset
  ..\..\..\runtime\python.exe avatar.py frames dk1 dk2 dk3 -> ../clips/<r>Ava + <r>/ava.js (przesunięcie ust)
"""
import os, sys, json, struct, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(C4Y, "lib")); sys.path.insert(0, os.path.join(C4Y, "schrony"))
import c4ykit
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))
AI = os.path.join(HERE, "ai"); BG = os.path.join(HERE, "bg")
WOMAN = ("an elegant Polish woman about 30 years old: long dark-blonde hair with soft waves, natural make-up, warm friendly face, cream silk blouse, "
         "tailored beige trousers, minimal gold jewelry")
COMMON = ("Photorealistic vertical smartphone video still for an Instagram UGC reel, filmed by a phone on a tripod at eye level, natural daylight, "
          "slight phone-camera softness, real skin texture. She looks straight into the lens like an influencer about to speak, relaxed natural posture, "
          "lips closed with a slight smile. Her face is in the upper third of the frame. The result is a clean natural photo of the room "
          "without any typography or graphic overlays.")
P1 = (f"Keep THIS exact furniture showroom from the image (the rows of chairs and bar stools, the wooden floor, the lighting). {WOMAN} sits on the "
      f"burgundy velvet bar stool in the foreground, turned towards the camera, feet on the footrest, hands resting on her knees. Upper body and the stool visible. {COMMON}")
P2 = (f"Keep THIS exact living room from the first image (the abstract painting, the sofa with black and white pillows, the patterned rug). The SAME woman "
      f"as in the second image (identical face, hair and outfit) sits comfortably in the colorful patterned wingback armchair, one hand on the armrest, "
      f"turned towards the camera. {COMMON}")
P3 = (f"Keep THIS exact dining room from the first image (the white dining table, the blush pink velvet chairs with gold legs, the ring lamps, the curtains). "
      f"The SAME woman as in the second image (identical face, hair and outfit) sits on one of the pink velvet chairs at the table, body turned "
      f"towards the camera, one arm resting on the table. {COMMON}")


def edit(prompt, refs, out):
    import falkit, urllib.request
    res = falkit.run("fal-ai/nano-banana-pro/edit", {"prompt": prompt, "image_urls": [falkit.host(r) for r in refs], "num_images": 1,
                                                     "aspect_ratio": "9:16", "resolution": "2K", "output_format": "png"})
    urllib.request.urlretrieve(res["images"][0]["url"], out); print("zapisano", out)


def lips(r):
    """b1 (hook) z głosu rolki -> usta Kling AI Avatar v2 pro"""
    import falkit
    rd = os.path.join(C4Y, r); T = json.load(open(os.path.join(rd, "timing.json"), encoding="utf-8"))
    a, z = T["lines"][0]["src"]
    clip = os.path.join(AI, f"{r}_b1.mp3")
    c4ykit.run(["-i", os.path.join(rd, "vo", "reel", "voice_t.mp3"), "-ss", f"{max(0, a - .03):.3f}", "-t", f"{z - a + .25:.3f}",
                "-af", "afade=t=out:st=%.3f:d=0.1" % (z - a + .12), "-c:a", "libmp3lame", "-q:a", "2", clip])
    falkit.run("fal-ai/kling-video/ai-avatar/v2/pro",
               {"image_url": falkit.host(os.path.join(AI, f"{r}.png")), "audio_url": falkit.host(clip),
                "prompt": "A friendly elegant woman talks calmly to the camera in a natural UGC style. Subtle, natural lip movements matching the "
                          "speech, relaxed jaw, small natural head movements, natural blinking, gentle smile. The camera does not move. "
                          "Clothes and background stay exactly as in the photo: no text, no letters, no symbols appear anywhere."},
               os.path.join(AI, f"{r}_av.mp4"))


def _env(path, rate=8000, hop=80):
    raw = subprocess.run([c4ykit.FF, "-v", "error", "-i", path, "-ac", "1", "-ar", str(rate), "-f", "s16le", "-"], capture_output=True).stdout
    s = struct.unpack(f"<{len(raw) // 2}h", raw)
    return [sum(abs(x) for x in s[i:i + hop]) / hop for i in range(0, len(s) - hop, hop)]


def offset(r):
    """o ile dźwięk w <r>_av.mp4 jest później niż nasz klip (s), korelacja obwiedni co 10 ms (pułapka Klinga ~20-30 ms)"""
    a, b = _env(os.path.join(AI, f"{r}_b1.mp3")), _env(os.path.join(AI, f"{r}_av.mp4"))
    n = min(len(a), len(b)); a, b = a[:n], b[:n]
    ma, mb = sum(a) / n, sum(b) / n
    a = [x - ma for x in a]; b = [x - mb for x in b]
    return max(range(-30, 31), key=lambda L: sum(a[i] * b[i + L] for i in range(max(0, -L), min(n, n - L)))) / 100


# pułapka Klinga: dorysowuje fałszywy napis w nieruchomej części kadru -> pas (y od, y do w 1080x1920) bierzemy z czystego zdjęcia, krawędzie 40 px miękkie
PATCH = {"dk1": [(1470, 1720)]}   # wersja Weronika miała napis w y 1060-1250, wersja Magdalena w y 1515-1680
VIEW = {"dk1": (1.1, 0), "dk2": (1.25, .2), "dk3": (1.35, .3)}   # kadr awatarki w rolce: (zoom startowy, zakotwiczenie y); domyślnie w html 1.2 / .25


def frames(r):
    name = r + "Ava"; out = os.path.join(c4ykit.CLIPS, name); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out): os.remove(os.path.join(out, f))
    bands = PATCH.get(r, []); vf = f"[0:v]fps=30,scale=1080:1920:flags=lanczos[v0]"
    if bands: vf += f";[1:v]scale=1080:1920:flags=lanczos,format=rgba,split={len(bands)}" + "".join(f"[s{i}]" for i in range(len(bands)))
    for i, (y0, y1) in enumerate(bands):
        vf += (f";[s{i}]geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(min((Y-{y0})/40,({y1}-Y)/40),0,1)'[p{i}];"
               f"[v{i}][p{i}]overlay=0:0[v{i + 1}]")
    c4ykit.run(["-i", os.path.join(AI, f"{r}_av.mp4"), "-i", os.path.join(AI, f"{r}.png"), "-filter_complex", vf, "-map", f"[v{len(bands)}]", "-an",
                "-q:v", "3", os.path.join(out, "%03d.jpg")])
    import pano
    pano.manifest_update({name: len(os.listdir(out))})
    off = offset(r); T = json.load(open(os.path.join(C4Y, r, "timing.json"), encoding="utf-8"))
    # klatka awatara dla czasu t rolki: t_av = t - slot_b1 + 0.03 (klip zaczyna się 30 ms przed b1) + off
    shift = round(-T["lines"][0]["slot"] + .03 + max(0, off), 3)
    z, ay = VIEW.get(r, (1.2, .25))
    open(os.path.join(C4Y, r, "ava.js"), "w", encoding="utf-8").write(
        f"window.AVA = {{clip: {json.dumps(name)}, shift: {shift}, off: {off}, z: {z}, ay: {ay}}};\n")
    print(r, name, len(os.listdir(out)), "klatek, przesunięcie Klinga", int(off * 1000), "ms")


if __name__ == "__main__":
    a = sys.argv[1:]; os.makedirs(AI, exist_ok=True)
    if a[0] == "img1": edit(P1, [os.path.join(BG, "hok_4.6.jpg")], os.path.join(AI, "dk1.png"))
    elif a[0] == "img23":
        edit(P2, [os.path.join(BG, "tul_9.8.jpg"), os.path.join(AI, "dk1.png")], os.path.join(AI, "dk2.png"))
        edit(P3, [os.path.join(BG, "wes_31.jpg"), os.path.join(AI, "dk1.png")], os.path.join(AI, "dk3.png"))
    elif a[0] == "lips": [lips(r) for r in a[1:]]
    elif a[0] == "frames": [frames(r) for r in a[1:]]
