r"""Rolka PV 3 „Rozczarowany fotowoltaiką?” (serwis PV, akcent pomarańczowy). Scenariusz: reklamy/pv-oze-v2/scenariusze.md (tekst użytkownika).
  ..\..\..\runtime\python.exe script.py clips voice timing stills    |    ZGODA=0.1 ELEVEN=1 ... voice timing stills audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "pv"))
import pvkit

LINES = [("c1", "Jesteś rozczarowany swoją fotowoltaiką?"),
         ("c2", "Miało być tanio, miało się zwrócić, a ty dalej dopłacasz do prądu i nie wiesz dlaczego?"),
         ("c3", "Nie jesteś jedyny. Ludzie bardzo często zgłaszają się do nas z instalacją, która od miesięcy działa poniżej możliwości."),
         ("c4", "A firma, która ją montowała, przestała odbierać telefony."),
         ("c5", "My zajmujemy się serwisem. Robimy bezpłatny przegląd, sprawdzamy panele, falownik, połączenia i ustawienia, a potem mówimy, co można poprawić."),
         ("c6", "Często wystarczy kilka zmian, żeby instalacja wreszcie zaczęła na siebie zarabiać."),
         ("c7", "Działamy w twoim powiecie. Umów bezpłatny przegląd, kliknij przycisk poniżej.")]
GAPS = {"c2": .5, "c3": .3, "c4": .25, "c5": .3, "c6": .3, "c7": .3}

if __name__ == "__main__":
    pvkit.main(HERE, "pv3", LINES, GAPS)
