r"""Rolka PV 2 „Kupujesz go z powrotem?” (magazyn energii, akcent niebieski i biały). Scenariusz: reklamy/pv-oze-v2/scenariusze.md (tekst użytkownika).
  ..\..\..\runtime\python.exe script.py clips voice timing stills    |    ZGODA=0.1 ELEVEN=1 ... voice timing stills audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "pv"))
import pvkit

LINES = [("b1", "Wiesz, co dzieje się z prądem z twoich paneli w ciągu dnia?"),
         ("b2", "Większość z niego oddajesz do sieci, bo w dzień nikogo nie ma w domu, a nikt go nie zużywa."),
         ("b3", "A wieczorem, kiedy wszyscy wracają i włączasz pralkę, piekarnik i światło…"),
         ("b4", "kupujesz ten prąd z powrotem. I to drożej."),
         ("b5", "W systemie net billing w dzień sprzedajesz tanio, a wieczorem płacisz pełną cenę. Na tej różnicy tracisz co miesiąc."),
         ("b6", "Magazyn energii zatrzymuje twój prąd w domu. To, co panele wyprodukują w dzień, wykorzystujesz wieczorem, a nie oddajesz za grosze."),
         ("b7", "Sprawdzimy za darmo, ile własnej energii możesz zatrzymać i czy magazyn ma u ciebie sens. Umów analizę instalacji, link poniżej.")]
GAPS = {"b2": .5, "b3": .3, "b4": .35, "b5": .3, "b6": .3, "b7": .3}

if __name__ == "__main__":
    pvkit.main(HERE, "pv2", LINES, GAPS)
