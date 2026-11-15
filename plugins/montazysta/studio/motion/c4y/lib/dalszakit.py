r"""Dalsza część reklamy po gotowym hooku AI (wzór: c4y/sek2 = AI1 „Sekunda” v2, zaakceptowany przez użytkownika 2026-10-25).
Hook zostaje bez zmian (tylko cięcie przed planszą z logo, bez wyciemnienia), dalej głos ElevenLabs + strona c4y
(papier, karty, B-role Mixkit maszynki), sklejenie hook + dalsza część, dźwięk -14 LUFS, limiter 0.70.
Skrypt reklamy podaje AD (dict) i woła main(AD):
  ..\..\..\runtime\python.exe script.py voice timing      (ZGODA=<kwota>, ElevenLabs)
  ..\..\..\runtime\python.exe script.py broll hook stills audio render sklej      (ZGODA=darmowe)
AD: here, name, out, hook (mp4 60 kl./s), hook_end (pierwsza klatka planszy), voice, lines [(key, tekst)],
    join (klucze, które ciągną zdanie poprzedniej linii), gaps, broll {klip maszynki: start s}, stills, music,
    hook_a_end (opcja, s): dźwięk hooka kończy się wcześniej, bo uderzenia planszy z logo zaczynają się ok. 0,2 s przed nią
"""
import os, sys, json, subprocess
HERE_LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_LIB)
import c4ykit
from c4ykit import longkit, kit, run, FF, CLIPS, ROOT


def voice(ad):
    d = os.path.join(ad["here"], "vo", "reel"); os.makedirs(d, exist_ok=True)
    seps = [" " if k in ad.get("join", ()) else None for k, _ in ad["lines"]]  # " " = to samo zdanie (jedna intonacja)
    kit.voice = lambda here, lines, seps_=None, voice_id=None: kit.voicekit.generate(here, lines, voice=voice_id, seps=seps)
    kit.tighten(d, [t for _, t in ad["lines"]], voice_id=ad["voice"], keep=ad.get("keep", .4))   # łagodnie: emocje i oddech zostają


def timing(ad):
    longkit.timing(ad["here"], [("reel", "Reel", ad["lines"])], ad["gaps"], t0=.35, hold=1.5)


def broll(ad):
    """B-role maszynki -> clips/<name>_<klip>/NNN.jpg (1280x720, 30 kl./s) + manifest"""
    man_p = os.path.join(CLIPS, "manifest.json"); man = json.load(open(man_p, encoding="utf-8"))
    for n, ss in ad["broll"].items():
        key = f"{ad['name']}_{n}"; d = os.path.join(CLIPS, key); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d):
            os.remove(os.path.join(d, f))
        run(["-ss", f"{ss}", "-t", "5", "-i", os.path.join(ROOT, "motion", "maszynka", "klipy", n + ".mp4"), "-an", "-vf",
             "fps=30,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720", "-q:v", "3", os.path.join(d, "%03d.jpg")])
        man[key] = len(os.listdir(d)); print(key, man[key])
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")


def hook_graph(ad):
    """[hv] obraz hooka do klatki hook_end, [ha] jego dźwięk do hook_a_end (krótkie wyciszenie, cisza do końca obrazu)"""
    e = ad["hook_end"]; hd = e / 60; ae = ad.get("hook_a_end", hd)
    return hd, (f"[0:v]trim=start_frame=0:end_frame={e},setpts=PTS-STARTPTS,fps=60,format=yuv420p,settb=AVTB[hv];"
                f"[0:a]atrim=0:{ae:.5f},asetpts=PTS-STARTPTS,aresample=48000,afade=t=out:st={ae - .04:.4f}:d=0.04,apad=whole_dur={hd:.5f}[ha]")


def hook(ad):
    """podgląd przyciętego hooka + ostatnia klatka (tail.png, pierwsza klatka dalszej części)"""
    hd, g = hook_graph(ad)
    run(["-i", ad["hook"], "-filter_complex", g, "-map", "[hv]", "-map", "[ha]", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", os.path.join(ad["here"], "hook_cut.mp4")])
    run(["-i", ad["hook"], "-vf", f"select=eq(n\\,{ad['hook_end'] - 1})", "-frames:v", "1", os.path.join(ad["here"], "tail.png")])
    print(f"hook_cut.mp4: {hd:.3f} s")


def lufs(p):
    r = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(r.rsplit("I:", 1)[1].split("LUFS")[0])


def sklej(ad):
    """hook (oryginalny plik, bez zmian obrazu) + dalsza część -> out, dźwięk -14 LUFS, limiter 0.70"""
    here = ad["here"]
    hd, g = hook_graph(ad)
    hc, cont = os.path.join(here, "hook_cut.mp4"), os.path.join(here, ad["name"] + ".mp4")
    g1, g2 = -14 - lufs(hc), -14 - lufs(cont)
    print(f"glosnosc: hook {g1:+.1f} dB, dalsza czesc {g2:+.1f} dB")
    g += (f";[1:v]setpts=PTS-STARTPTS,fps=60,format=yuv420p,settb=AVTB[cv];[hv][cv]concat=n=2:v=1:a=0[v]"
          f";[ha]volume={g1:.2f}dB[h2];[1:a]aresample=48000,volume={g2:.2f}dB[c2];[h2][c2]concat=n=2:v=0:a=1,alimiter=limit=0.70:level=disabled[a]")
    out = os.path.join(here, ad["out"])
    run(["-i", ad["hook"], "-i", cont, "-filter_complex", g, "-map", "[v]", "-map", "[a]", "-r", "60", "-c:v", "libx264", "-crf", "17",
         "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out])
    run(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(here, "f0.jpg")])
    print("gotowe:", out)


def main(ad):
    c4ykit.FPS = 60   # hooki AI mają 60 kl./s, dalsza część też
    for s in sys.argv[1:]:
        if s == "voice": voice(ad)
        elif s == "timing": timing(ad)
        elif s == "broll": broll(ad)
        elif s == "hook": hook(ad)
        elif s == "stills": c4ykit.stills(ad["here"], ad["name"], ad["stills"])
        elif s == "audio": c4ykit.audio(ad["here"], ad["name"], ad.get("music", "proof.mp3"))
        elif s == "render": c4ykit.render(ad["here"], ad["name"])
        elif s == "sklej": sklej(ad)
