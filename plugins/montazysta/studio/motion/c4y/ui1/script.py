r"""Clips4you ui1: pierwsza rolka w stylu „UI motion” (wzór: reklama runbee.pl, 2026-10-11): czarne tło, żółty akcent,
makiety ekranów (post, telefon, menedżer reklam, powiadomienia), kinetyczny tekst, narrator ElevenLabs eleven_v3 z tagami emocji.
Struktura: kim jesteś (pytanie) -> ból -> „posłuchaj tego” -> wizja -> „dlatego powstało” -> proces -> „nie musisz / tylko” -> CTA.
  ..\..\..\runtime\python.exe script.py voice timing reel     (voice = ElevenLabs, płatne kredyty abonamentu)
  ..\..\..\runtime\python.exe script.py stills audio render   (0 zł)
"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit
import longkit
import voicekit
import subprocess

NAME = "ui1"
# tagi emocji tylko na początku kwestii (aligner szuka czystego tekstu kwestii w strumieniu znaków)
LINES = [("b1", "[curious]", "Masz firmę, która żyje z poleceń?"),
         ("b2", "", "Wrzucasz posty. Czekasz... A telefon milczy."),
         ("b3", "[whispers]", "Posłuchaj tego."),
         ("b4", "[excited]", "Jedna dobra rolka. Dobrze ustawiona reklama. I telefon zaczyna dzwonić."),
         ("b5", "[confident]", "Dlatego powstało Clips for you."),
         ("b6", "", "Rozmawiamy o Twojej firmie. Robimy rolki. Puszczamy reklamy. Ty dostajesz zapytania."),
         ("b7", "", "Nie musisz nagrywać. Nie musisz znać się na reklamach."),
         ("b8", "[excited]", "Ty tylko odbierasz telefon."),
         ("b9", "", "Kliknij i umów piętnaście minut rozmowy.")]
GAPS = {"b2": .25, "b3": .45, "b4": .45, "b5": .4, "b6": .5, "b7": .4, "b8": .15, "b9": .45}
MUSIC = "saas_leads.mp3"
STILLS = [0, 1.5, 4, 6.5, 8, 10, 12.5, 15, 18, 21, 24, 27, 29.5]


def voice():
    d = os.path.join(HERE, "vo", "reel"); os.makedirs(d, exist_ok=True)
    mp3, alp = os.path.join(d, "voice.mp3"), os.path.join(d, "alignment.json")
    if not (os.path.exists(mp3) and os.path.exists(alp)):  # jedno wywołanie, tekst z tagami
        text = voicekit.join([(tag + " " + tx).strip() for _, tag, tx in LINES])
        audio, al = voicekit._tts_with_timestamps(text, voicekit.VOICE, voicekit.MODEL)
        open(mp3, "wb").write(audio)
        json.dump({"text": text, "alignment": al}, open(alp, "w", encoding="utf-8"), ensure_ascii=False)
    c4ykit.kit.tighten(d, [tx for _, _, tx in LINES])  # z pamięci podręcznej: szuka czystych kwestii, tnie martwe pauzy


def reel_frames():
    """nasza rolka r10 (postać AI w żółtym garniturze) jako klatki do telefonu w scenie „jedna dobra rolka”"""
    out = os.path.join(HERE, "reel"); os.makedirs(out, exist_ok=True)
    c4ykit.run(["-ss", "0.3", "-t", "5", "-i", os.path.join(HERE, "..", "r10", "r10_dyn.mp4"), "-an", "-vf",
                "fps=30,scale=540:960:force_original_aspect_ratio=increase,crop=540:960", "-q:v", "3", os.path.join(out, "%03d.jpg")])
    n = len([f for f in os.listdir(out) if f.endswith(".jpg")])
    open(os.path.join(HERE, "reel.js"), "w").write(f"window.REELN = {n};\n")
    print("reel frames:", n)


def render():
    v = os.path.join(HERE, "video.mp4")
    dur = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8"))["DUR"]
    subprocess.run([c4ykit.PY, os.path.join(c4ykit.MOTION, "render.py"), os.path.join(HERE, NAME + ".html"), v, "--size", "1080x1920",
                    "--fps", "60", "--sub", "2", "--workers", "6", "--crf", "18", "--end", f"{dur:.2f}"], check=True)
    out = os.path.join(HERE, NAME + ".mp4")
    c4ykit.run(["-i", v, "-i", os.path.join(HERE, "audio.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac",
                "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
    c4ykit.run(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(HERE, "f0.jpg")])
    print("done:", out)


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "voice" in steps:
        voice()
    if "timing" in steps:
        longkit.timing(HERE, [("reel", "Reel", [(k, tx) for k, _, tx in LINES])], GAPS, t0=.02, hold=1.8)
    if "reel" in steps:
        reel_frames()
    if "stills" in steps:
        c4ykit.stills(HERE, NAME, STILLS)
    if "audio" in steps:
        c4ykit.audio(HERE, NAME, MUSIC, bed=-24.0)
    if "render" in steps:
        render()
