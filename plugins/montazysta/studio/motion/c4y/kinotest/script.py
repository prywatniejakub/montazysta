r"""TEST TECHNICZNY silnika lib/kino.py (0 zł): klipy z kino2 (deszczowy Pałac -> pokój -> twarz) doklejone do reklamy 09.
To NIE jest gotowa reklama (wstęp z kobietą nie pasuje do gościa z reklamy): sprawdza tylko wycenę, arkusze, nakładki,
dopasowanie 768p/24 kl. do 1080x1920/60 kl., J-cut i dźwięki.
  ..\..\..\runtime\python.exe script.py wycena | arkusz | sklej
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import kino

PLAN = dict(
    name="kinotest",
    frames=[dict(id="k1", prompt="-"), dict(id="k2", prompt="-", refs=["k3"]), dict(id="k3", prompt="-")],
    clips=[dict(id="v1", first="k1", last="k2", secs=4, prompt="-"),
           dict(id="v2", first="k2", last="k3", secs=7, prompt="-", cut=(0.0, 2.4)),
           dict(id="v3", first="k3", secs=4, prompt="-", cut=(0.5, 3.0), role="insert")],
    overlay=dict(call="WŁAŚCICIELE FIRM", caps=[(0.0, 2.6, "To zdjęcie <b>nie istnieje</b>"), (2.6, 6.2, "A Ty właśnie<br><b>przestałeś scrollować</b>")],
                 ai=[(3.6, 6.88)]),
    graft=dict(ad=r"../ad9/ad9.mp4", jcut=0.5, vol=0.8, sfx=[(3.3, "WH_SOFT", -6), (6.85, "IMP_SOFT", -8)],
               inserts=[dict(clip="v3", at=9.0)]),
)

if __name__ == "__main__":
    kino.main(HERE, PLAN)
