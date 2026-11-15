r"""Clips4you odbicie O03 (2026-10-26): zwycięska Reklama 03 („30 rolek albo miesiąc gratis”, Go4Driver) pod nową ofertę („pozyskujemy klientów rolkami”, minimum 30 spotkań).
Tekst zaakceptowany przez użytkownika 2026-10-26: reklamy/odbicia-v2/scenariusze.md. Hook: postać z banku, scena C (studio), głos Tom.
  ..\..\..\runtime\python.exe script.py voice timing hook stills    potem    script.py audio render
  (voice i hook = kredyty ElevenLabs i fal: tylko po zgodzie użytkownika, wiedza/feedback-zero-wydatkow-bez-zgody.md)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import adkit, c4ykit

NAME, SCENE, START = "o03", "C", 0.0
TOM = "JWUOwsYG4XgR9Od3eeon"  # Tom Kowalsky: głos reklam Clips4you (Adam zakazany, wiedza/feedback-reklamy-wideo-n1-poprawki.md)
LINES = [("b1", "Właścicielu firmy, minimum trzydzieści spotkań z rolek takich jak ta albo pracujemy za darmo."),
         ("b2", "Tak, dobrze słyszysz. Oto jak to działa."),
         ("b3", "Robimy rolki o Twojej firmie, takie jak ta."),
         ("b4", "Pokazujemy je ludziom, którzy szukają tego, co robisz."),
         ("b5", "Kto się zgłosi, od razu trafia do Twojego telefonu."),
         ("b6", "Ty tylko dzwonisz i rozmawiasz. To wszystko."),
         ("b7", "Kliknij i umów piętnaście minut rozmowy.")]
GAPS = {"b2": 0.12, "b3": 0.12, "b4": 0.12, "b5": 0.12, "b6": 0.12, "b7": 0.14}
CLIPS = ["sa02", "sa01", "ico1", "ico2", "banana", "yomi1", "pointab"]
STILLS = [0, 1.5, 3.0, 4.5, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0]
c4ykit.render.__defaults__ = (2,)  # 3 rolki renderują się naraz na 4 rdzeniach (prośba użytkownika 2026-10-26)

if __name__ == "__main__":
    if "voice" in sys.argv:
        d = os.path.join(HERE, "vo", "reel"); os.makedirs(d, exist_ok=True)
        c4ykit.kit.tighten(d, [t for _, t in LINES], voice_id=TOM)
        sys.argv.remove("voice")
    if len(sys.argv) > 1:
        adkit.main(HERE, NAME, LINES, GAPS, CLIPS, "proof.mp3", STILLS, SCENE, START)
