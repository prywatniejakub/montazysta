r"""Clips4you reklama 15 (oferta v2, zestaw 1 „AI UGC”), wiedza/clips4you-3-rolki-oferta-v2.md.
Hook: ten sam bohater co zwycięskie reklamy 03 i 12, scena C (studio). Usta: Sync Lipsync v2 pro + RIFE (jak w zwycięskich reklamach; LatentSync dał rozmazane usta, poprawka 2026-10-07).
  ..\..\..\runtime\python.exe script.py voice timing hook stills    potem    script.py audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import adkit

NAME, SCENE, START = "ad15", "C", 0.0
LINES = [("b1", "Właścicielu firmy, piętnaście rolek z osobą w miesiącu."),
         ("b2", "I nikt z Twojej firmy nie staje przed kamerą."),
         ("b3", "Wiesz, że rolka z człowiekiem działa lepiej. Tylko pracownicy nie chcą się nagrywać, a twórca bierze kilkaset złotych za jedną."),
         ("b4", "My tworzymy osobę dla Twojej marki i robimy z nią piętnaście rolek, w różnych miejscach."),
         ("b5", "Dostajesz plan tematów do akceptacji i co tydzień paczkę rolek z godzinami publikacji."),
         ("b6", "Nie dowieziemy piętnastu, następny miesiąc robimy za darmo."),
         ("b7", "Kliknij i umów piętnaście minut rozmowy.")]
GAPS = {"b2": .1, "b3": .12, "b4": .12, "b5": .12, "b6": .12, "b7": .14}
CLIPS = ["sa02", "sa01", "ico1", "ico2", "banana", "yomi1", "pointab"]
STILLS = [0, 2.0, 4.5, 7.0, 10.0, 13.0, 16.0, 19.0, 22.0, 25.0]

if __name__ == "__main__":
    adkit.main(HERE, NAME, LINES, GAPS, CLIPS, "proof.mp3", STILLS, SCENE, START)
