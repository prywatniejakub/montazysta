"""Wspólne narzędzia silnika: ścieżki, ffmpeg, przeglądarka, odczyt projektu. Działa na macOS i Windows."""
import json, os, pathlib, shutil, subprocess, sys

SILNIK = pathlib.Path(__file__).resolve().parent
DOM = pathlib.Path(os.environ.get("MONTAZYSTA_DOM", pathlib.Path.home() / ".montazysta"))
PRACA = pathlib.Path(os.environ.get("MONTAZYSTA_PRACA", pathlib.Path.home() / "Montaz"))
FPS = 30


def program(nazwa):
    """ffmpeg / ffprobe: z PATH, z Homebrew albo z ~/.montazysta/bin."""
    for k in (shutil.which(nazwa), f"/opt/homebrew/bin/{nazwa}", f"/usr/local/bin/{nazwa}",
              DOM / "bin" / nazwa, DOM / "bin" / f"{nazwa}.exe"):
        if k and os.path.exists(k):
            return str(k)
    raise SystemExit(f"Brak programu {nazwa}. Uruchom instalację: /montazysta:start")


def ff(*args):
    subprocess.run([program("ffmpeg"), "-y", "-v", "error", *map(str, args)], check=True)


def wyjscie(cmd):
    r = subprocess.run(list(map(str, cmd)), capture_output=True, text=True, encoding="utf-8", errors="replace")
    return (r.stdout or "") + (r.stderr or "")


def przegladarka():
    """Chrome albo Edge z systemu; gdy ich nie ma, Chromium pobrany przez instalację do ~/.montazysta/chromium."""
    kandydaci = [os.environ.get("MONTAZYSTA_CHROME"),
                 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                 "/Applications/Chromium.app/Contents/MacOS/Chromium",
                 "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
                 "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
                 r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                 r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                 r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                 shutil.which("google-chrome"), shutil.which("chromium")]
    for k in kandydaci:
        if k and os.path.exists(k):
            return k
    for wzor in ("Google Chrome for Testing", "Chromium", "chrome.exe", "chrome"):
        for p in (DOM / "chromium").rglob(wzor):
            if p.is_file():
                return str(p)
    raise SystemExit("Brak przeglądarki Chrome. Uruchom instalację: /montazysta:start")


def projekt(sciezka):
    """Folder rolki: pełna ścieżka albo sama nazwa w ~/Montaz/rolki."""
    p = pathlib.Path(sciezka).expanduser()
    if not p.is_dir():
        p = PRACA / "rolki" / str(sciezka)
    if not (p / "rolka.json").exists():
        raise SystemExit(f"Nie ma projektu {sciezka} (brak rolka.json).")
    return p.resolve()


def spec(P):
    return json.loads((P / "rolka.json").read_text(encoding="utf-8"))


def sciezka_zrodla(P, wpis):
    plik = wpis["plik"] if isinstance(wpis, dict) else wpis
    p = pathlib.Path(plik).expanduser()
    return p if p.is_absolute() else (P / p).resolve()


def zapisz_js(plik, **zmienne):
    pathlib.Path(plik).write_text("".join(f"window.{k} = {json.dumps(v, ensure_ascii=False)};\n" for k, v in zmienne.items()), encoding="utf-8")


def utf8():
    for s in (sys.stdout, sys.stderr):
        s.reconfigure(encoding="utf-8")
