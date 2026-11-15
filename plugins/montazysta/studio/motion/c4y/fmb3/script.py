r"""Fundusz Modernizacji Budynków (klient OZE), rolka 3 „Dofinansowanie do 16 000 zł” (odbicie FMB 06). Scenariusz: reklamy/oze-fmb-v1 (v2 po recenzji, txt/03.txt).
Kolejność: voice (Edge 0 zł) timing clips stills -> recenzja klatek -> ElevenLabs po zgodzie -> glos.py -> audio render.
  ..\..\..\runtime\python.exe script.py clips voice timing stills audio render   (ElevenLabs: ZGODA=<kwota> ELEVEN=1)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "oze"))
import ozekit

NAME = "fmb3"
LINES = [("c1", "Dom z fotowoltaiką i bez magazynu energii?"),
         ("c2", "Na magazyn można dostać dofinansowanie, nawet do szesnastu tysięcy złotych."),
         ("c3", "Ale nie każdy dom spełnia warunki."),
         ("c4", "Lokalny instalator przyjedzie za zero złotych, bez zobowiązań."),
         ("c5", "Sprawdzi falownik, moc i wiek instalacji."),
         ("c6", "Powie, czy Twój dom spełnia warunki dofinansowania."),
         ("c7", "Wniosek składasz Ty, a wycenę dostajesz dopiero po wizycie."),
         ("c8", "Sprawdź, zanim kupisz magazyn. Formularz zajmuje minutę, oddzwonimy.")]
GAPS = {"c2": .2, "c3": .3, "c4": .3, "c5": .2, "c6": .2, "c7": .3, "c8": .3}
CLIPS = []

if __name__ == "__main__":
    ozekit.main(HERE, NAME, LINES, GAPS, "g4d_calm.mp3", clips=CLIPS)
