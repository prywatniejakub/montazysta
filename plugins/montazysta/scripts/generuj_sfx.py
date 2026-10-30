"""Generuje własne efekty dźwiękowe (bez cudzych licencji): dwa przesunięcia, dwa uderzenia, pop. Uruchamiane raz, pliki leżą w silnik/audio/sfx."""
import pathlib, wave
import numpy as np

SR = 48000
CEL = pathlib.Path(__file__).resolve().parents[1] / "silnik" / "audio" / "sfx"
rng = np.random.default_rng(7)


def zapisz(nazwa, x):
    x = x / max(1e-6, np.abs(x).max()) * .9
    fade = np.linspace(1, 0, int(SR * .01))
    x[-len(fade):] *= fade
    d = (x * 32767).astype(np.int16)
    with wave.open(str(CEL / f"{nazwa}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())


def przesuniecie(sek, szczyt, f0, f1, ostrosc):
    """Szum przepuszczony przez filtr, którego środek sunie w górę i w dół: klasyczny „whoosh”."""
    n = int(SR * sek)
    t = np.arange(n) / sek / SR
    obw = np.where(t < szczyt, (t / szczyt) ** ostrosc, ((1 - t) / (1 - szczyt)) ** (ostrosc * 1.4))
    kat = np.where(t < szczyt, t / szczyt, (1 - t) / (1 - szczyt))
    fc = f0 + (f1 - f0) * kat ** 1.5
    szum, wyj, lp1, lp2 = rng.normal(size=n), np.zeros(n), 0.0, 0.0
    for i in range(n):
        a = 1 - np.exp(-2 * np.pi * fc[i] / SR)
        lp1 += a * (szum[i] - lp1)
        lp2 += a * .35 * (szum[i] - lp2)
        wyj[i] = lp1 - lp2
    return wyj * obw


def uderzenie(sek, f_start, f_kon, tlumienie, szum_ile):
    n = int(SR * sek)
    t = np.arange(n) / SR
    f = f_kon + (f_start - f_kon) * np.exp(-t * 28)
    faza = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(faza) + szum_ile * rng.normal(size=n) * np.exp(-t * 90)) * np.exp(-t * tlumienie)


def pop():
    n = int(SR * .09)
    t = np.arange(n) / SR
    f = 320 + 900 * np.exp(-t * 60)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 48)


CEL.mkdir(parents=True, exist_ok=True)
zapisz("WH_SOFT", przesuniecie(.5, .44, 180, 2200, 2.2))
zapisz("WH_SWING", przesuniecie(.34, .47, 260, 4200, 1.8))
zapisz("IMP_SOFT", uderzenie(.7, 180, 62, 6.5, .12))
zapisz("IMP_BASS", uderzenie(1.1, 140, 44, 4.2, .08))
zapisz("POP", pop())
print("gotowe:", sorted(p.name for p in CEL.iterdir()))
