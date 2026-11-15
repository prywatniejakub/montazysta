r"""Żółty Szalik, rolka 3 (pakiet start8): „Co się dzieje po telefonie?” (do rodzin, proces krok po kroku, styl spokojny i ciepły).
Fakty od Emila (Meet 2026-10-09): telefon 24 h, detoks w cenie, gdy pacjent zostaje na terapii, terapia w klinice 28 dni (alkohol) albo 42 dni.
  ..\..\..\runtime\python.exe script.py voice timing stills audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "zsz"))
import zskit

NAME = "zs3"
LINES = [("b1", "Boisz się zadzwonić po pomoc? Zobacz, co dzieje się po telefonie."),
         ("b2", "Odbieramy całą dobę. Rozmowa jest anonimowa."),
         ("b3", "Razem ustalamy termin przyjęcia."),
         ("b4", "Jeśli trzeba, najpierw detoks pod opieką lekarza. Gdy pacjent zostaje na terapii, detoks jest w cenie."),
         ("b5", "Potem terapia w klinice: dwadzieścia osiem dni przy alkoholu, czterdzieści dwa przy pozostałych uzależnieniach."),
         ("b6", "Pracujemy też z rodziną."),
         ("b7", "Pierwszy krok to jeden telefon: pięćset jeden, zero jedenaście, sto jeden.")]
CLIPS = [("zs3_hook", 7279746, 4, 4.5)]
GAPS = {"b2": .35, "b3": .25, "b4": .3, "b5": .3, "b6": .25, "b7": .35}

if __name__ == "__main__":
    zskit.main(HERE, NAME, LINES, GAPS, "g4d_calm.mp3", bed=-21.0, edge_voice=zskit.ZOFIA, hold=1.5, clips=CLIPS)
