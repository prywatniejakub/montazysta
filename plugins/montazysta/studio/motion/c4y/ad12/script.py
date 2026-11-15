r"""Clips4you reklama 12 (ranking #13, karta oferty, szablon T7, wzór Burnett „What LAWYERS get from our package” (12 reklam)):
„Uwaga, tylko dla właścicieli firm. Oto co dostajesz co miesiąc.” Paczka otwiera się i wyskakują z niej: 1 h rozmowy, 30 rolek,
publikacja codziennie, pieczęć gwarancji wykonania. Bez ceny. Scena C (studio), trzeci fragment (START 2.7 s, ad3 = 0, ad9 = 1.8).
  ..\..\..\runtime\python.exe script.py voice timing hook stills    potem    script.py audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import adkit

NAME, SCENE, START = "ad12", "C", 2.7
LINES = [("b1", "Uwaga, tylko dla właścicieli firm. Oto co dostajesz co miesiąc."),
         ("b2", "Godzinę rozmowy, w której pytamy o to, o co pytają Cię klienci."),
         ("b3", "Trzydzieści rolek z napisami i montażem."),
         ("b4", "Publikację na Instagramie, TikToku, Facebooku i YouTube. Codziennie jedną."),
         ("b5", "A jeśli nie dowieziemy trzydziestu rolek, następny miesiąc robimy za darmo."),
         ("b6", "Kliknij i umów piętnaście minut rozmowy.")]
GAPS = {"b2": .14, "b3": .14, "b4": .14, "b5": .16, "b6": .14}
CLIPS = ["sa02", "sa01", "ico1", "ico2", "banana", "yomi1", "pointab"]
STILLS = [0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0]

if __name__ == "__main__":
    adkit.main(HERE, NAME, LINES, GAPS, CLIPS, "steady.mp3", STILLS, SCENE, START)
