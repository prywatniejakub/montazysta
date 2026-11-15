r"""Clips4you odbicie O15 (2026-10-26): zwycięska Reklama 15 („15 rolek z osobą”, Kolmed) pod nową ofertę („pozyskujemy klientów rolkami”, minimum 30 spotkań).
Tekst zaakceptowany przez użytkownika 2026-10-26: reklamy/odbicia-v2/scenariusze.md. Hook: postać z banku, scena C (studio), głos Tom.
  ..\..\..\runtime\python.exe script.py voice timing hook stills    potem    script.py audio render
  (voice i hook = kredyty ElevenLabs i fal: tylko po zgodzie użytkownika, wiedza/feedback-zero-wydatkow-bez-zgody.md)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import adkit, c4ykit

NAME, SCENE, START = "o15", "C", 2.0
TOM = "JWUOwsYG4XgR9Od3eeon"  # Tom Kowalsky: głos reklam Clips4you (Adam zakazany, wiedza/feedback-reklamy-wideo-n1-poprawki.md)
LINES = [("b1", "Właścicielu firmy, pozyskujemy klientów rolkami. Takimi jak ta."),
         ("b2", "Ty prowadzisz firmę, a rolki i reklamy bierzemy na siebie."),
         ("b3", "Ludzie wybierają firmy, które już znają. Rolka to jeden z najszybszych sposobów, żeby poznali Twoją."),
         ("b4", "Pokazujemy Twoje rolki ludziom, którzy szukają tego, co robisz."),
         ("b5", "Kto się zgłosi, od razu trafia do Twojego telefonu. Ty dzwonisz i rozmawiasz."),
         ("b6", "Minimum trzydzieści spotkań albo pracujemy bez opłat."),
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
