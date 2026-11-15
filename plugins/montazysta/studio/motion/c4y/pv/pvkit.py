r"""Silnik rolek PV dla klienta OZE (2026-11-14): pv1-pv4. Obraz: kadry AI z motion/c4y/pv_kadry (8 sztuk, wspólne) + stock Pexels z ludźmi
(oze/stock -> clips/pv_*), grafiki i plansze pv.js. Głos: Edge Marek (0 zł, do arkusza klatek) albo ElevenLabs głos marki P2 (ELEVEN=1, po zgodzie).
  ..\..\..\runtime\python.exe script.py clips voice timing stills          (Edge, arkusz klatek pvN_arkusz.jpg)
  ZGODA=0.1 ELEVEN=1 ..\..\..\runtime\python.exe script.py voice timing stills audio render
Uwaga: przed ELEVEN usuń vo/ (inaczej zostaje stary głos z cache).
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "oze"))
import ozekit  # noqa: E402

CLIPS = [("pv_bill", "7546415", 0, 6), ("pv_worry", "5981293", 0, 6), ("pv_hands", "8853514", 0, 6),
         ("pv_meter", "18780266", 0, 5), ("pv_panday", "9788591", 1, 5)]


def main(here, name, lines, gaps, music="g4d_calm.mp3", bed=-24.0):
    ozekit.main(here, name, lines, gaps, music, clips=CLIPS, bed=bed, eleven_voice=None, hold=1.2)
