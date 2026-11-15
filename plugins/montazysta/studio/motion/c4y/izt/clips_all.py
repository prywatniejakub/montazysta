r"""Klipy z budów Izzi Therm do wszystkich rolek it1-it6 (2026-10-27). 0 zł (lokalnie).
  ..\..\..\runtime\python.exe clips_all.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import izkit
Z1, Z2, Z3 = "zip1/Izzi Therm/", "zip2/", "zip3/"
ITEMS = [
    ("iz_hose", Z2 + "proces3.mp4", 1.0, 6.0, {"slow": 2.5}),      # wąż podaje masę (120 kl./s -> zwolnione)
    ("iz_hose2", Z2 + "proces3.mp4", 5.5, 4.0, {"slow": 2.0}),
    ("iz_spread", Z2 + "proces3.mp4", 12.5, 5.0),                  # wykonawca rozgarnia masę
    ("iz_pipes", Z1 + "CD6D50AD-63CA-4140-AF9F-997CE4B310C2.MP4", 1.6, 4.4),   # niebieskie rury przed zalaniem
    ("iz_cover", Z1 + "CD6D50AD-63CA-4140-AF9F-997CE4B310C2.MP4", 6.2, 3.0),   # masa wokół rur
    ("iz_redpipes", Z1 + "CD6D50AD-63CA-4140-AF9F-997CE4B310C2.MP4", 9.2, 3.2),
    ("iz_feet", Z1 + "IMG_6615.MP4", 0.0, 7.5),                     # chodzenie po gotowej masie
    ("iz_mix", Z2 + "proces 2.mp4", 0.0, 3.2),                      # mieszalnik
    ("iz_pile", Z2 + "proces 2.mp4", 4.5, 5.5),                     # wąż w piwnicy, kopiec masy
    ("iz_gran", Z2 + "PROCES.mp4", 0.0, 1.9),                       # biały granulat styropianu do maszyny
    ("iz_bag", Z2 + "PROCES.mp4", 1.9, 4.0),
    ("iz_corr", Z2 + "PROCES.mp4", 9.0, 3.0),                       # wąż w korytarzu z rurami
    ("iz_lata", Z3 + "Kopia 20251211_105441.mp4", 0.0, 6.0, {"cx": .38}),   # łata wyrównuje
    ("iz_team", Z3 + "Kopia 20251211_103749.mp4", 0.0, 8.0, {"cx": .55}),
    ("iz_podl", Z3 + "ogrzewanie podłogowe 2.mp4", 1.0, 6.0),       # podłogówka na masie
    ("iz_room", Z1 + "IMG_6582.MP4", 0.0, 6.0),                      # gotowy pokój
    ("iz_attic", Z1 + "IMG_6616.MP4", 0.0, 6.0),
    ("iz_win", Z1 + "IMG_6447.MP4", 6.0, 8.0),                        # okna, pole, masa
    ("iz_laser", Z1 + "IMG_6597.MP4", 3.0, 5.0),                      # laser na statywie
    ("iz_wall", Z3 + "Kopia 20260618_160636.mp4", 8.0, 6.0),          # podawanie przy ścianie na folii
]
if __name__ == "__main__":
    only = sys.argv[1:]
    izkit.clips([i for i in ITEMS if not only or i[0] in only])
