r"""Clips4you YouTube films (16:9, PL): voice "Adam" per chapter with pauses cut (kit.tighten) -> longkit timing ->
page (fN.html on motion/kuba/lib/saas.js + c4yfilm.js/.css: jasny styl clips4you.pl, animacje SaaS) -> audio -> render -> mux.
The shared ending (kim jesteśmy + oferta + CTA) is voiced ONCE in yt/f1/vo/my and reused by every film (same take, no credits).
"""
import os, sys, json, subprocess
LIB = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(LIB)
MOTION = os.path.dirname(C4Y)
ROOT = os.path.dirname(MOTION)
sys.path.insert(0, os.path.join(MOTION, "kuba", "lib"))
sys.path.insert(0, os.path.join(MOTION, "kuba"))
sys.path.insert(0, os.path.join(MOTION, "lib"))
import longkit  # noqa: E402
import voicekit  # noqa: E402
kit = longkit.kit
PY = os.path.join(ROOT, "runtime", "python.exe")
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")

ENDING = [
    ("e1", "Kim jesteśmy? Clips for you to nowa marka, ale nie nowi ludzie. Nasz zespół od ponad siedmiu lat robi reklamy w internecie, dla ponad stu pięćdziesięciu firm."),
    ("e2", "Tak mogą wyglądać Twoje rolki."),
    ("e3", "Tak wygląda miesiąc z nami. Jedna godzina rozmowy. Trzydzieści rolek. Publikacja codziennie."),
    ("e4", "Jeśli w miesiącu nie dostaniesz trzydziestu rolek, następny miesiąc robimy za darmo. Bez umowy na rok."),
    ("e5", "Bierzemy najwyżej pięć nowych firm w miesiącu. I tylko takie, które już działają i mają klientów."),
    ("e6", "Chcesz zobaczyć, jakie rolki zrobilibyśmy dla Twojej firmy? Wejdź na clips for you kropka pe el i umów piętnaście minut rozmowy."),
]
ENDING_DIR = os.path.join(C4Y, "yt", "f1", "vo", "my")


def voice(here, chapters):
    for cid, _, lines in chapters:
        d = os.path.join(here, "vo", cid)
        same = os.path.normcase(os.path.abspath(d)) == os.path.normcase(ENDING_DIR)
        if cid == "my" and not same and os.path.exists(os.path.join(ENDING_DIR, "lines.json")):
            os.makedirs(d, exist_ok=True)  # reuse the one take of the shared ending
            ls = json.load(open(os.path.join(ENDING_DIR, "lines.json"), encoding="utf-8"))
            if isinstance(ls, dict):
                ls = ls["lines"]
            ls = [{**l, "file": os.path.relpath(os.path.join(ENDING_DIR, "voice_t.mp3"), d)} for l in ls]
            json.dump({"lines": ls}, open(os.path.join(d, "lines.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print("== my: reused from f1")
            continue
        os.makedirs(d, exist_ok=True)
        print("==", cid)
        kit.tighten(d, [t for _, t in lines], voice_id=voicekit.VOICE)


def main(here, name, chapters, gaps, music="saas_long.mp3", bed=-24.5):
    steps = sys.argv[1:] or ["voice", "timing"]
    if "voice" in steps:
        voice(here, chapters)
    if "timing" in steps:
        longkit.timing(here, chapters, gaps, gap=.26, ch_gap=.6, t0=.08, hold=2.2)
    if "stills" in steps:  # $env:STILLS="1,5,9"
        subprocess.run([PY, os.path.join(MOTION, "render.py"), os.path.join(here, name + ".html"), os.path.join(here, "stills"),
                        "--size", "1920x1080", "--stills", os.environ.get("STILLS", "1,20,60")], check=True)
    if "audio" in steps:
        longkit.audio(here, name, longkit.page_sfx(here, name), music=os.path.join(kit.ASSETS, "music", music), bed=bed)
    if "render" in steps:  # never render a film with text outside its box / JS errors (user 2026-09-30: 3rd time)
        sys.path.insert(0, os.path.join(C4Y, "yt"))
        import check
        if not check.check(os.path.join(here, name + ".html")):
            raise SystemExit("RENDER ZABLOKOWANY: popraw błędy z check.py (tekst poza ramką / błędy JS)")
        dur = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))["DUR"]
        subprocess.run([PY, os.path.join(MOTION, "render.py"), os.path.join(here, name + ".html"), os.path.join(here, "video.mp4"),
                        "--size", "1920x1080", "--fps", "30", "--sub", "2", "--workers", os.environ.get("LK_WORKERS", "6"),
                        "--crf", "18", "--end", f"{dur:.2f}"], check=True)
    if "mux" in steps:
        kit.mux(here, "video.mp4", name, os.path.join(here, name + ".mp4"))
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", os.path.join(here, name + ".mp4"),
                        "-frames:v", "1", "-q:v", "2", os.path.join(here, "f0.jpg")], check=True)
        fix_frame0(here, name)


# ---------------------------------------------------------------- package: TXT (title, description with chapters, tags,
# pinned comment, settings) + desktop folder INNE PROJEKTY\Clips4you - YouTube\Filmy\Do wrzucenia\<Tytuł>\ + Telegram
YT_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "INNE PROJEKTY", "Clips4you - YouTube", "Filmy", "Do wrzucenia")


def chapters_txt(here, names=None):
    """YouTube chapters from timing.json: first at 0:00, each at least 11 s after the previous one (YouTube needs >= 10 s)"""
    T = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))
    out = []
    for i, c in enumerate(T["chapters"]):
        a = 0 if not i else int(c["a"] + .5)
        if out and a - out[-1][0] < 11:
            a = out[-1][0] + 11
        out.append([a, (names or {}).get(c["id"], c["title"])])
    return "\n".join(f"{a // 60}:{a % 60:02d} {n}" for a, n in out)


def package(here, name, title, alts, lead, names, tags, pinned, extra=""):
    ch = chapters_txt(here, names)
    txt = f"""TYTUŁ (nazwa pliku = tytuł na YouTube)
{title}

ZAPASOWE TYTUŁY (YouTube: Test i porównanie)
""" + "\n".join(f"- {a}" for a in alts) + f"""

OPIS (pole "Opis", kopiuj od następnej linii)
{lead}

W filmie:
{ch}

Chcesz zobaczyć, jakie rolki zrobilibyśmy dla Twojej firmy? Umów 15 minut rozmowy: link w opisie kanału 👆
Bierzemy najwyżej 5 nowych firm w miesiącu.

Clips4you. My robimy rolki. Ty odbierasz telefony.
{extra}
#rolki #marketing #firma

TAGI (pole "Tagi", kopiuj całą linię)
{tags}

PRZYPIĘTY KOMENTARZ
{pinned}

USTAWIENIA
- Język filmu: polski. Kategoria: Nauka i edukacja.
- Nie jest dla dzieci.
- Treści zmienione lub syntetyczne: NIE (animacje; lektor to syntetyczny głos, który nie udaje żadnej prawdziwej osoby).
- Okładka 1 = główna, okładka 2 = do testu (Test i porównanie).
- Ekran końcowy: kolejny film z kanału + Subskrybuj. Playlista: „Rolki dla firm”.
- ZERO linków w opisie i komentarzu (nowy kanał). Link do clips4you.pl tylko w opisie kanału.
- ZERO cen (ceny tylko na stronie).
"""
    assert len(tags) <= 500, f"tags {len(tags)} > 500"
    p = os.path.join(here, "opis.txt")
    open(p, "w", encoding="utf-8").write(txt)
    return p


def export(here, name, title, thumbs, prompts=None, tg_send=True):
    import shutil
    d = os.path.join(YT_DIR, title)
    os.makedirs(d, exist_ok=True)
    shutil.copy2(os.path.join(here, name + ".mp4"), os.path.join(d, title + ".mp4"))
    shutil.copy2(os.path.join(here, "opis.txt"), os.path.join(d, title + ".txt"))
    for i, t in enumerate(thumbs):
        shutil.copy2(t, os.path.join(d, f"{title} - okładka {i + 1}{' (główna)' if i == 0 else ''}.png"))
    if prompts:
        shutil.copy2(prompts, os.path.join(d, f"{title} - prompty do miniatur (AI).txt"))
    print("pulpit:", d)
    if tg_send:
        sys.path.insert(0, os.path.join(MOTION, "kuba"))
        import tg
        tg.send(os.path.join(here, name + ".mp4"), os.path.join(here, "opis.txt"), title, None)
        tg.api("sendPhoto", {"chat_id": tg.chat_id(), "caption": f"Okładka 1 (główna): {title}"}, files={"photo": thumbs[0]}) if hasattr(tg, "api") else None
        print("telegram: wysłane")


def fix_frame0(here, name):
    """The renderer sometimes grabs frame 0 before the page is fully painted (washed-out frame 0 in f1/f2, 2026-09-30):
    frame 0 is always replaced with a sharp still of t=0 (thumbnail alive = frame 0 must be perfect), then re-muxed."""
    st = os.path.join(here, "_f0")
    subprocess.run([PY, os.path.join(MOTION, "render.py"), os.path.join(here, name + ".html"), st, "--size", "1920x1080", "--stills", "0"], check=True)
    png = os.path.join(st, "s000.00.png")
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", os.path.join(here, "video.mp4"), "-loop", "1", "-i", png, "-filter_complex",
                    "[1:v]format=yuv420p[s];[0:v][s]overlay=0:0:enable='lt(t,0.02)':shortest=1[v]", "-map", "[v]", "-c:v", "libx264",
                    "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", os.path.join(here, "video_f0.mp4")], check=True)
    kit.mux(here, "video_f0.mp4", name, os.path.join(here, name + ".mp4"))
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", os.path.join(here, name + ".mp4"), "-frames:v", "1", "-q:v", "2", os.path.join(here, "f0.jpg")], check=True)
    print("frame 0 replaced with a sharp still")
