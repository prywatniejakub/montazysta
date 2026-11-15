r"""Wersje TikTok rolek Żółtego Szalika (2026-10-19): bez numeru telefonu w kadrze i w głosie (numer w opisie profilu),
w zs2 bez nalewania i trzymania kieliszka. Powód: zasady TikToka o „marketing… restricted medical services” obejmują
podawanie kontaktu, a picie w kadrze w części regionów wyklucza z For You (rozkmina-emil-platformy-reklamy-2026-10-19).
Folder <rolka>tt = kopia głosu + strona z window.TT=1; ostatnia linia lektora ucięta po słowie przed numerem. 0 zł.
  ..\..\..\runtime\python.exe tiktok.py zoltyszalik zs2 zs3 zs4 (paczka 2: zs5 zs6 zs7 zs8)      (kroki: build audio render; domyślnie wszystkie)
"""
import json, os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit  # noqa: E402

C4Y = c4ykit.C4Y
# rolka: (klucz ostatniej linii, słowo, po którym ucinamy, muzyka, podkład, zapas na końcu)
SRC = {"zoltyszalik": ("z7", "anonimowo", "g4d_calm.mp3", -21.0, 2.2), "zs2": ("a6", "dobę", "steady.mp3", -21.0, 2.2),
       "zs3": ("b7", "telefon", "g4d_calm.mp3", -21.0, 2.2), "zs4": ("c6", "dobę", "schrony_dark.mp3", -20.0, 2.2),
       # paczka 2 (2026-10-27)
       "zs5": ("d7", "dobę", "steady.mp3", -21.0, 2.2), "zs6": ("e8", "dobę", "g4d_calm.mp3", -21.0, 2.2),
       "zs7": ("f7", "dobę", "steady.mp3", -21.0, 2.2), "zs8": ("g6", "dobę", "schrony_dark.mp3", -20.0, 2.2)}
CLIPS = [("zstt_a", 7698901, 8, 3), ("zstt_b", 7279746, 12, 3),  # zamienniki ujęć z alkoholem w zs2
         ("zs5tt_a", 7279738, 12, 4), ("zs5tt_b", 7279743, 10, 4)]  # i w zs5 (piwo, whisky)


def norm(s):
    return re.sub(r"[^\wąćęłńóśźż]", "", s.lower())


def quiet_point(mp3, a, z):
    """najcichsze 10 ms w nagraniu między a i z (sekundy) = miejsce cięcia przed numerem telefonu"""
    import array, subprocess
    pre = .1  # dekoder daje ciszę na początku odczytu: czytamy wcześniej i te klatki pomijamy
    raw = subprocess.run([c4ykit.FF, "-v", "error", "-ss", f"{a - pre:.3f}", "-t", f"{z - a + pre:.3f}", "-i", mp3, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True).stdout
    x = array.array("h", raw); n = 160; skip = int(pre * 16000 / n)
    rms = [sum(v * v for v in x[i:i + n]) / n for i in range(0, max(1, len(x) - n), n)]
    cand = list(range(skip, len(rms)))
    k = min(cand, key=lambda i: rms[i]) if cand else skip
    return round(a - pre + (k * n + n / 2) / 16000, 3)


def build(name):
    key, cut, music, bed, hold = SRC[name]
    src, dst = os.path.join(C4Y, name), os.path.join(C4Y, name + "tt")
    os.makedirs(dst, exist_ok=True)
    for sub in ("vo", "img"):
        if os.path.isdir(os.path.join(src, sub)) and not os.path.isdir(os.path.join(dst, sub)):
            shutil.copytree(os.path.join(src, sub), os.path.join(dst, sub))
    h = open(os.path.join(src, name + ".html"), encoding="utf-8").read()
    h = h.replace("<body>", "<body>\n<script>window.TT = 1;</script>", 1).replace(f'boot("{name}.m4a")', f'boot("{name}tt.m4a")')
    open(os.path.join(dst, name + "tt.html"), "w", encoding="utf-8").write(h)
    T = json.load(open(os.path.join(src, "timing.json"), encoding="utf-8"))
    L = next(l for l in T["lines"] if l["key"] == key)
    assert L is T["lines"][-1], "ucinamy tylko ostatnią linię"
    idx = next(i for i, w in enumerate(L["words"]) if norm(w["w"]).startswith(norm(cut)))
    nxt = L["words"][idx + 1]["t"] if idx + 1 < len(L["words"]) else None
    L["words"] = L["words"][:idx + 1]
    end_t = L["words"][-1]["e"]
    to_src = lambda t: L["src"][0] + (t - L["slot"])
    cut_src = quiet_point(os.path.join(dst, L["file"]), to_src(end_t) - .06, to_src(nxt if nxt else end_t) + .12)
    end_t = round(L["slot"] + (cut_src - L["src"][0]), 3)  # koniec głosu = najcichsze miejsce przed numerem
    L["src"][1] = round(cut_src - .16, 3)  # longkit.audio dokłada 0,16 s po ostatniej linii
    L["text"] = " ".join(w["w"] for w in L["words"])
    T["DUR"] = round(end_t + hold, 2)
    for c in T["chapters"]: c["z"] = min(c["z"], end_t)
    json.dump(T, open(os.path.join(dst, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(dst, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print(f"{name}tt: ostatnia linia „{L['text']}”, DUR {T['DUR']} s")
    return dst, music, bed


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a in SRC] or list(SRC)
    steps = [a for a in sys.argv[1:] if a not in SRC] or ["build", "audio", "render"]
    if "clips" in steps:
        sys.path.insert(0, HERE)
        import zskit
        zskit.stock(CLIPS)
    for n in args:
        dst, music, bed = build(n)
        if "stills" in steps:
            D = json.load(open(os.path.join(dst, "timing.json"), encoding="utf-8"))["DUR"]
            c4ykit.stills(dst, n + "tt", [round(x * .5, 2) for x in range(int(D / .5) + 1)])
        if "audio" in steps: c4ykit.audio(dst, n + "tt", music, bed=bed)
        if "render" in steps: c4ykit.render(dst, n + "tt", workers=5)
        if "mux" in steps:  # tylko nowy dźwięk do gotowego obrazu
            out = os.path.join(dst, n + "tt.mp4")
            c4ykit.run(["-i", os.path.join(dst, "video.mp4"), "-i", os.path.join(dst, "audio.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
            print("mux:", out)
