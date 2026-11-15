"""Style montażu agencji Clips4you 01-24: prawdziwe silniki stylów w ~/Montaz/studio (instalacja i aktualizacja je odświeża).
  style                         lista stylów: numer, nazwa, status, kiedy używać, folder wzorcowy
  styl <nr>                     pełna karta stylu: przepis, silnik, wzór, koszt, notatki
  nowy <nr> <nazwa>             nowa rolka w stylu: kopia kodu wzoru (script.py, html, js, css) obok wzoru, bez materiałów
  uruchom <nazwa> <kroki...>    kroki silnika w folderze rolki (np. clips voice timing stills audio render)
  gdzie <nazwa>                 pełna ścieżka folderu rolki
Na końcu kroku render powstaje <nazwa>.mp4 w folderze rolki. Płatny głos ElevenLabs i fal tylko po zgodzie użytkownika.
"""
import argparse, json, os, pathlib, re, shutil, subprocess, sys

import narzedzia as N

STUDIO = pathlib.Path(os.environ.get("C4Y_ROOT") or (N.PRACA / "studio"))
KATALOG = STUDIO / "wiedza" / "mapa" / "style-montazu.js"
KOD = {".py", ".html", ".js", ".css", ".mjs", ".svg"}


def katalog():
    if not KATALOG.exists():
        raise SystemExit("Brak paczki stylów w ~/Montaz/studio. Uruchom skill montazysta-start (aktualizacja).")
    src = KATALOG.read_text(encoding="utf-8")
    return json.loads(src[src.index("=", src.index("window.STYLE_MONTAZU")) + 1:].strip().rstrip(";"))


def styl_nr(nr):
    for s in katalog()["style"]:
        if int(s["nr"]) == int(nr):
            return s
    raise SystemExit(f"Nie ma stylu {nr}. Lista: studio style")


# Style bez własnego skryptu we wzorze: 10 = tryb spokojny silnika stylu 09 (nazwa rolki w CALM w lib/g4s.py).
ALIAS = {10: 9}


def folder_wzoru(s):
    """Folder ze skryptem: najpierw z pola wzor (np. motion/c4y/kzd1), potem z pola silnik (np. motion/c4y/kolmed-styl),
    z pominięciem wspólnych bibliotek (lib)."""
    kandydaci = re.findall(r"motion/[\w/.-]+", s.get("wzor", "")) + re.findall(r"motion/[\w/.-]+", s.get("silnik", ""))
    for kand in kandydaci:
        p = STUDIO / kand.rstrip(".,)")
        if p.is_file():
            p = p.parent
        if p.name == "lib" or p == STUDIO / "motion" or not p.is_dir():
            continue
        if any(p.glob("*.py")):
            return p
    if int(s["nr"]) in ALIAS:
        return folder_wzoru(styl_nr(ALIAS[int(s["nr"])]))
    return None


def style(_):
    for s in katalog()["style"]:
        if s["status"] == "stop":
            continue
        w = folder_wzoru(s)
        print(f"{int(s['nr']):02d} [{s['status']}] {s['nazwa']}: {s.get('kiedy', '')[:90]}  (wzór: {w.name if w else 'brak w paczce'})")
    return 0


def karta(a):
    s = styl_nr(a.nr)
    print(json.dumps({k: s.get(k) for k in ("nr", "nazwa", "status_t", "co", "kiedy", "przepis", "silnik", "wzor", "koszt", "notatki")},
                     ensure_ascii=False, indent=1))
    return 0


def nowy(a):
    s = styl_nr(a.nr)
    if s["status"] == "stop":
        raise SystemExit(f"Styl {a.nr} jest na liście „nie używać”: {s.get('notatki', '')}")
    wzor = folder_wzoru(s)
    if not wzor:
        raise SystemExit(f"Styl {a.nr} nie ma folderu wzorcowego w paczce. Zbuduj rolkę wg karty: studio styl {a.nr}")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,40}", a.nazwa):
        raise SystemExit("Nazwa: małe litery, cyfry i myślniki, np. kolmed-zima1")
    cel = wzor.parent / a.nazwa  # obok wzoru, bo silniki importują ../lib, ../oze itd.
    if cel.exists():
        raise SystemExit(f"Folder już jest: {cel}")
    cel.mkdir(parents=True)
    for f in wzor.iterdir():
        if f.is_file() and f.suffix.lower() in KOD:
            tekst = f.read_text(encoding="utf-8")
            if f.stem == wzor.name:  # pliki nazwane jak wzór (kzd1.html) dostają nazwę rolki
                cel_f = cel / f"{a.nazwa}{f.suffix}"
            else:
                cel_f = cel / f.name
            cel_f.write_text(tekst.replace(f'"{wzor.name}"', f'"{a.nazwa}"'), encoding="utf-8")
    print(f"Nowa rolka w stylu {int(s['nr']):02d} {s['nazwa']}: {cel}")
    print("Dalej: podmień teksty, kolejność i materiały w script.py (i html), potem: studio uruchom", a.nazwa, "<kroki>")
    print("Kroki i przepis: studio styl", a.nr)
    return 0


def znajdz(nazwa):
    for baza in (STUDIO / "motion" / "c4y", STUDIO / "motion" / "kuba", STUDIO / "motion"):
        if (baza / nazwa / "script.py").exists():
            return baza / nazwa
    raise SystemExit(f"Nie ma rolki {nazwa} w ~/Montaz/studio (brak script.py).")


def uruchom(a):
    P = znajdz(a.nazwa)
    env = dict(os.environ, C4Y_ROOT=str(STUDIO))
    env["PATH"] = str(N.DOM / "env" / "bin") + os.pathsep + env.get("PATH", "")
    return subprocess.run([sys.executable, "script.py", *a.kroki], cwd=P, env=env).returncode


def gdzie(a):
    print(znajdz(a.nazwa))
    return 0


def main():
    N.utf8()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = ap.add_subparsers(dest="cmd", required=True)
    s.add_parser("style").set_defaults(f=style)
    p = s.add_parser("styl"); p.add_argument("nr", type=int); p.set_defaults(f=karta)
    p = s.add_parser("nowy"); p.add_argument("nr", type=int); p.add_argument("nazwa"); p.set_defaults(f=nowy)
    p = s.add_parser("uruchom"); p.add_argument("nazwa"); p.add_argument("kroki", nargs="*"); p.set_defaults(f=uruchom)
    p = s.add_parser("gdzie"); p.add_argument("nazwa"); p.set_defaults(f=gdzie)
    a = ap.parse_args()
    sys.exit(a.f(a) or 0)


if __name__ == "__main__":
    main()
