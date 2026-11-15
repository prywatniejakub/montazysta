r"""AI2 „Zatrzymałeś się” v2 (2026-10-25, reklamy/baza-v3/hooki-ai-dalsza-czesc.md): gotowy hook c4y/r10/r10_dyn.mp4 bez zmian
(ucięta tylko plansza z logo, bez ust Kling: decyzja użytkownika 2026-10-25) + dalsza część jak AI1 (c4y/sek2, lib/dalszakit.py).
Głos dalszej części: Tom Kowalsky (głos tej samej postaci w AI3; hook AI2 ma głos z modelu wideo, różnicę użytkownik przyjął).
  ..\..\..\runtime\python.exe script.py voice timing      (ZGODA=<kwota>, ElevenLabs)
  ..\..\..\runtime\python.exe script.py broll hook stills audio render sklej      (ZGODA=darmowe)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import dalszakit

AD = dict(
    here=HERE, name="zat2", out="AI2_zatrzymales_v2.mp4",
    hook=os.path.join(HERE, "..", "r10", "r10_dyn.mp4"), hook_end=584,   # od kl. 584 (9,73 s) czerń planszy
    hook_a_end=9.62,   # „firmie.” kończy się ok. 9,58 s, od 9,64 s słychać już uderzenie planszy (recenzent 2026-10-25)
    voice="JWUOwsYG4XgR9Od3eeon",   # Tom Kowalsky
    lines=[("b1", "[warmly] Robimy takie rolki dla firm,"),
           ("b2", "w których jeden klient to kilka tysięcy złotych."),
           ("b3", "[thoughtful] Robisz swoją robotę dobrze."),
           ("b4", "A klient dzwoni do firmy, którą już widział w telefonie."),
           ("b5", "Najpierw robimy film o Twojej firmie."),
           ("b6", "Potem pokazujemy go ludziom, którzy szukają takiej usługi."),
           ("b7", "Na końcu każdy, kto się zgłosi, od razu jest w Twoim telefonie."),
           ("b8", "Ty dzwonisz."),
           ("b9", "[confident] Minimum trzydzieści spotkań w dziewięćdziesiąt dni."),
           ("b10", "Gdy jest ich mniej, pracujemy dalej bez opłaty za obsługę, aż je dowieziemy."),
           ("b11", "Cztery krótkie pytania w formularzu."),
           ("b12", "Sprawdzimy, czy Twoja firma do nas pasuje.")],
    join={"b2", "b12"},
    gaps={"b2": .08, "b3": .28, "b4": .2, "b5": .32, "b6": .25, "b7": .25, "b8": .25, "b9": .35, "b10": .25, "b11": .35, "b12": .1},
    broll={"biurko": 1.0, "studio": 1.0, "scroll": 1.0, "telefon2": 1.0},
    stills=[.15, 1.2, 4.0, 6.5, 9.0, 12.0, 15.0, 18.5, 21.5, 25.0, 30.0, 34.5],
)

if __name__ == "__main__":
    dalszakit.main(AD)
