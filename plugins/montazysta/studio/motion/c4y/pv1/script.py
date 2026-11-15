r"""Rolka PV 1 „Obiecali 0 zł za prąd?” (klient OZE, akcent niebieski). Scenariusz: reklamy/pv-oze-v2/scenariusze.md (tekst użytkownika).
  ..\..\..\runtime\python.exe script.py clips voice timing stills    |    ZGODA=0.1 ELEVEN=1 ... voice timing stills audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "pv"))
import pvkit

LINES = [("a1", "Obiecali ci zero złotych za prąd?"),
         ("a2", "To dlaczego rachunki dalej przychodzą… i wcale nie są małe?"),
         ("a3", "Zainwestowałeś w fotowoltaikę, żeby mieć spokój. Ale bardzo często instalacja produkuje dużo mniej, niż powinna, a ty nawet o tym nie wiesz."),
         ("a4", "Źle ustawiony falownik, zabrudzone panele, uszkodzony przewód albo zła taryfa. Każda z tych rzeczy po cichu zjada twoje oszczędności."),
         ("a5", "Dlatego w twoim powiecie robimy bezpłatne analizy instalacji. Przyjeżdżamy, sprawdzamy wszystko krok po kroku i mówimy wprost, co jest nie tak."),
         ("a6", "Ponad pięćset sprawdzonych instalacji i ocena cztery przecinek dziewięć w Google. Kliknij poniżej i umów bezpłatną analizę.")]
GAPS = {"a2": .5, "a3": .3, "a4": .25, "a5": .3, "a6": .3}

if __name__ == "__main__":
    pvkit.main(HERE, "pv1", LINES, GAPS)
