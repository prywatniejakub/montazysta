r"""Rolka próbna Clips4you dla Żółty Szalik (Emil, ośrodek leczenia uzależnień, Meet 2026-10-09 17:30): do RODZIN osób uzależnionych.
„Znowu obiecał, że to ostatni raz?” Styl lib/prem.js (spokojniejszy), lektorka ElevenLabs Magdalena (zgoda użytkownika 2026-10-09).
Obraz = zdjęcia z zoltyszalik.com.pl (img/pNN.jpg), bez twarzy pacjentów. Fakty tylko ze strony: placówka medyczna, detoks, opieka lekarska,
domowa atmosfera, praca z rodziną („choruje cała rodzina”), 15 lat doświadczenia, pełna anonimowość, tel. 501 011 101.
  ..\..\..\runtime\python.exe script.py voice timing   potem   stills   potem   audio render
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit

NAME = "zoltyszalik"
MAGDALENA = "N0GCuK2B0qwWozQNTS8F"  # dojrzały, ciepły głos kobiecy (PL)
LINES = [("z1", "Znowu obiecał, że to ostatni raz?"),
         ("z2", "Uzależnienie to choroba. Choruje na nią cała rodzina."),
         ("z3", "Leczenie zaczyna się od bezpiecznego detoksu, pod opieką lekarza."),
         ("z5", "Pracujemy też z bliskimi."),
         ("z6", "Piętnaście lat doświadczenia. Pełna anonimowość."),
         ("z7", "Porozmawiaj z nami anonimowo: pięćset jeden, zero jedenaście, sto jeden.")]
GAPS = {"z2": .3, "z3": .22, "z5": .2, "z6": .2, "z7": .25}

if __name__ == "__main__":
    steps = sys.argv[1:]
    if "voice" in steps:
        if os.environ.get("ELEVEN_OK") != "1":
            raise SystemExit("ElevenLabs = wydatek: tylko po zgodzie użytkownika (ustaw ELEVEN_OK=1)")
        os.makedirs(os.path.join(HERE, "vo", "reel"), exist_ok=True)
        c4ykit.kit.tighten(os.path.join(HERE, "vo", "reel"), [t for _, t in LINES], voice_id=MAGDALENA)
    if "timing" in steps: c4ykit.timing(HERE, LINES, GAPS, hold=2.2)
    if "stills" in steps:
        import json
        D = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8"))["DUR"]
        c4ykit.stills(HERE, NAME, [round(x * .75, 2) for x in range(int(D / .75) + 1)])
    if "audio" in steps: c4ykit.audio(HERE, NAME, "g4d_calm.mp3", bed=-21.0)
    if "render" in steps: c4ykit.render(HERE, NAME, workers=5)
