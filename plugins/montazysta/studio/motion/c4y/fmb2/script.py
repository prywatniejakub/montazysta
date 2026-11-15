r"""Fundusz Modernizacji Budynków (klient OZE), rolka 2 „Falownik stoi w południe” (odbicie FMB 67). Scenariusz: reklamy/oze-fmb-v1 (v2 po recenzji, txt/02.txt).
Kolejność: voice (Edge 0 zł) timing clips stills -> recenzja klatek -> ElevenLabs po zgodzie -> glos.py -> audio render.
  ..\..\..\runtime\python.exe script.py clips voice timing stills audio render   (ElevenLabs: ZGODA=<kwota> ELEVEN=1)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "oze"))
import ozekit

NAME = "fmb2"
LINES = [("b1", "Latem falownik wyłączał Ci się w samo południe?"),
         ("b2", "Najwięcej słońca, a produkcja stoi."),
         ("b3", "To nie zawsze awaria."),
         ("b4", "Często winne jest za wysokie napięcie w sieci. Falownik się wtedy zabezpiecza."),
         ("b5", "Lokalny instalator przyjedzie i sprawdzi przyczynę."),
         ("b6", "Powie też, czy magazyn energii ma u Ciebie sens i czy Twój falownik go obsłuży."),
         ("b7", "Za zero złotych, bez zobowiązań."),
         ("b8", "Wypełnij formularz, zanim wiosną falownik znów stanie. Oddzwonimy.")]
GAPS = {"b2": .2, "b3": .25, "b4": .2, "b5": .3, "b6": .2, "b7": .25, "b8": .3}
CLIPS = []

if __name__ == "__main__":
    ozekit.main(HERE, NAME, LINES, GAPS, "steady.mp3", clips=CLIPS)
