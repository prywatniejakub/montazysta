r"""Izzi Therm, rolka 1 (filar: Ból, rola: zasięg): „Dlaczego po latach pęka płytka?”.
Fakty: broszura PISP (InspekcjaDomu.pl 2026: 34,8% odbiorów z pękniętą lub krzywą wylewką, 1690 odbiorów; AQC: szkoda średnio po 5,9 roku), słowa Piotra 2026-10-20.
  ..\..\..\runtime\python.exe script.py voice timing stills audio render   (ElevenLabs: ZGODA=<kwota> ELEVEN=1)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "izt"))
import izkit

NAME = "it1"
LINES = [("b1", "Budujesz dom? Zobacz, co psuje się po latach."),
         ("b2", "Nie okno. Podłoga. Płytka chodzi, klepka pęka."),
         ("b3", "Bo pękła wylewka. A pod nią zostały puste przestrzenie."),
         ("b4", "Przy odbiorach domów pękniętą lub krzywą wylewkę wskazano w ponad co trzecim."),
         ("b5", "We Francji takie szkody wychodziły średnio po prawie sześciu latach."),
         ("b6", "Masa styropianowa wypełnia całą przestrzeń pod wylewką. Bez pustek."),
         ("b7", "Zanim wylejesz posadzkę, sprawdź, co będzie pod nią."),
         ("b8", "Umów darmową konsultację. Porozmawiasz z Piotrem, który sprawdzi, czy to pasuje do Twojej budowy.")]
GAPS = {"b2": .3, "b3": .25, "b4": .3, "b5": .25, "b6": .3, "b7": .3, "b8": .35}

if __name__ == "__main__":
    izkit.main(HERE, NAME, LINES, GAPS, "proof.mp3", bed=-21.0, hold=2.6)
