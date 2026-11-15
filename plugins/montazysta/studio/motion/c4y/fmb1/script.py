r"""Fundusz Modernizacji Budynków (klient OZE), rolka 1 „W dzień oddajesz, wieczorem kupujesz” (odbicie FMB 02). Scenariusz: reklamy/oze-fmb-v1 (v2 po recenzji, txt/01.txt).
Kolejność: voice (Edge 0 zł) timing clips stills -> recenzja klatek -> ElevenLabs po zgodzie -> glos.py -> audio render.
  ..\..\..\runtime\python.exe script.py clips voice timing stills audio render   (ElevenLabs: ZGODA=<kwota> ELEVEN=1)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "oze"))
import ozekit

NAME = "fmb1"
LINES = [("a1", "W dzień Twoje panele oddają prąd do sieci."),
         ("a2", "Wieczorem kupujesz go z powrotem, drożej."),
         ("a3", "Tak działa net-billing w domu bez magazynu."),
         ("a4", "Magazyn energii zatrzymuje nadwyżkę na wieczór."),
         ("a5", "Ale nie do każdego falownika da się go podpiąć."),
         ("a6", "Lokalny instalator sprawdzi to u Ciebie za zero złotych, bez zobowiązań."),
         ("a7", "Oceni falownik, moc i wiek instalacji."),
         ("a8", "Wycenę dostaniesz dopiero po wizycie, nie przez telefon."),
         ("a9", "Zostaw numer w krótkim formularzu. Oddzwonimy.")]
GAPS = {"a2": .2, "a3": .3, "a4": .3, "a5": .2, "a6": .3, "a7": .2, "a8": .2, "a9": .3}
CLIPS = [("oz_estate", "px168801", 1, 5), ("oz_panel1", "9788591", 0, 4), ("oz_panel2", "9788590", 2, 4), ("oz_panel3", "9788592", 2, 4),
         ("oz_panel4", "px83903", 1, 4), ("oz_sky", "px156444", 1, 6), ("oz_evening", "14461064", 1, 4), ("oz_bluehour", "19670547", 1, 4),
         ("oz_zakop", "19758280", 1, 4), ("oz_snoworch", "5970116", 2, 4), ("oz_tykocin", "27302017", 1, 4), ("oz_sunset", "32555566", 1, 4),
         ("oz_tower", "34312355", 1, 6), ("oz_meter", "18780266", 0, 5)]  # wspólne dla fmb1-3 (clips/oz_*)

if __name__ == "__main__":
    ozekit.main(HERE, NAME, LINES, GAPS, "steady.mp3", clips=CLIPS)
