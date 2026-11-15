r"""Rolka PV 4 „Sprawdź jedną liczbę” (autotest w aplikacji, akcent złoty; scenariusz Claude'a po recenzji). reklamy/pv-oze-v2/scenariusze.md
  ..\..\..\runtime\python.exe script.py clips voice timing stills    |    ZGODA=0.1 ELEVEN=1 ... voice timing stills audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "pv"))
import pvkit

LINES = [("d1", "Masz fotowoltaikę? Sprawdź jedną liczbę."),
         ("d2", "Otwórz aplikację falownika i zobacz, ile instalacja wyprodukowała przez pełny ostatni rok."),
         ("d3", "W Polsce każdy kilowat paneli daje rocznie około tysiąca kilowatogodzin. Masz sześć kilowatów? Przy dobrym ustawieniu dachu powinno wyjść blisko sześciu tysięcy."),
         ("d4", "Wychodzi ci dużo mniej? To prąd, za który już zapłaciłeś, a którego nie masz."),
         ("d5", "Przyjedziemy i bezpłatnie sprawdzimy, gdzie ucieka: falownik, panele, przewody czy ustawienia."),
         ("d6", "Ponad pięćset sprawdzonych instalacji i ocena cztery przecinek dziewięć w Google. Kliknij poniżej i umów bezpłatną analizę.")]
GAPS = {"d2": .5, "d3": .3, "d4": .3, "d5": .3, "d6": .3}

if __name__ == "__main__":
    pvkit.main(HERE, "pv4", LINES, GAPS)
