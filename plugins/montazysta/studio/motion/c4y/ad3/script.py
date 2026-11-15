r"""Clips4you reklama 03 (ranking #3, szablon T2 „gwarancja + jak to działa krok po kroku”, wzór School of Mentors / Seattle):
„30 rolek w miesiącu albo następny miesiąc za darmo” (gwarancja WYKONANIA, nie wyników). Hook: postać z banku, scena C (studio).
  ..\..\..\runtime\python.exe script.py voice timing hook stills    potem    script.py audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import adkit

NAME, SCENE, START = "ad3", "C", 0.0
LINES = [("b1", "Właścicielu firmy, trzydzieści rolek w miesiącu albo następny miesiąc robimy za darmo."),
         ("b2", "Tak, dobrze słyszysz. Oto jak to działa."),
         ("b3", "Raz w miesiącu rozmawiamy przez godzinę. Pytamy o to, o co pytają Cię klienci."),
         ("b4", "Z tej rozmowy robimy trzydzieści rolek, z napisami i montażem."),
         ("b5", "I publikujemy je za Ciebie. Codziennie jedną."),
         ("b6", "Ty tylko odpowiadasz na pytania. To wszystko."),
         ("b7", "Kliknij i umów piętnaście minut rozmowy.")]
GAPS = {"b2": .12, "b3": .12, "b4": .12, "b5": .12, "b6": .12, "b7": .14}
CLIPS = ["sa02", "sa01", "ico1", "ico2", "banana", "yomi1", "pointab"]
STILLS = [0, 2.5, 5.5, 8.0, 11.0, 14.0, 17.0, 20.0, 23.0]

if __name__ == "__main__":
    adkit.main(HERE, NAME, LINES, GAPS, CLIPS, "proof.mp3", STILLS, SCENE, START)
