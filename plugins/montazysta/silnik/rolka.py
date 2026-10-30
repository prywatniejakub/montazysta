"""Polecenia silnika montażu (uruchamia je agent montażysta):
  sprawdz                         czy są wszystkie narzędzia
  nowa <nazwa> [pliki...]         nowy projekt w ~/Montaz/rolki/<nazwa>
  info <projekt>                  dane źródeł + 3 klatki podglądu do ustawienia kadru
  pobierz <url> <projekt>         film z linku do projektu (tylko materiał, do którego masz prawa)
  strona <url> <plik.png>         zrzut strony w widoku telefonu, cała wysokość
  transkrypcja <projekt>          słowa z czasem, ponumerowane fragmenty
  lektor <projekt>                darmowy lektor Edge z sekcji lektor
  buduj <projekt>                 klatki, oś czasu, napisy, ścieżka głosu
  klatki <projekt> [--co 0.5]     podgląd: klatki + arkusz chk/sheet.jpg
  dzwiek <projekt>                miks głosu, muzyki i efektów
  render <projekt>                gotowy MP4
  kontrola <projekt|plik.mp4>     test gotowego filmu
  glos <audio> <tekst.txt>        czy lektor powiedział dokładnie tekst
"""
import argparse, json, os, pathlib, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import narzedzia as N  # noqa: E402


def sprawdz(_):
    zle = 0
    def wiersz(ok, opis, co=""):
        nonlocal zle
        zle += 0 if ok else 1
        print(("  OK    " if ok else "  BRAK  ") + opis + ("" if ok else f": {co}"))
    for p in ("ffmpeg", "ffprobe"):
        try:
            wiersz(True, f"{p} ({N.program(p)})")
        except SystemExit:
            wiersz(False, p, "brew install ffmpeg")
    try:
        wiersz(True, f"przeglądarka ({N.przegladarka()})")
    except SystemExit:
        wiersz(False, "przeglądarka", "zainstaluj Chrome")
    for mod, pip in (("websocket", "websocket-client"), ("faster_whisper", "faster-whisper"), ("edge_tts", "edge-tts"), ("yt_dlp", "yt-dlp")):
        try:
            __import__(mod); wiersz(True, pip)
        except ImportError:
            wiersz(False, pip, f"pip install {pip}")
    wiersz((N.SILNIK / "web" / "fonts" / "montserrat-latin-900-normal.woff2").exists(), "czcionka Montserrat", "brak w plikach silnika")
    print("GOTOWE" if not zle else f"DO ZROBIENIA: {zle}")
    return 1 if zle else 0


def nowa(a):
    P = N.PRACA / "rolki" / a.nazwa
    P.mkdir(parents=True, exist_ok=True)
    (P / "materialy").mkdir(exist_ok=True)
    zr = {}
    for i, f in enumerate(a.pliki):
        p = pathlib.Path(f).expanduser().resolve()
        cel = P / "materialy" / p.name
        if not cel.exists():
            shutil.copy2(p, cel)
        zr[chr(97 + i)] = {"plik": f"materialy/{p.name}"}
    if not (P / "rolka.json").exists():
        (P / "rolka.json").write_text(json.dumps({"styl": "dynamiczny", "akcent": "#ffd23f", "zrodla": zr, "ujecia": []}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(P)


def info(a):
    import obraz
    P = N.projekt(a.projekt)
    S = N.spec(P)
    (P / "podglad").mkdir(exist_ok=True)
    for k, wpis in S["zrodla"].items():
        plik = N.sciezka_zrodla(P, wpis)
        inf = obraz.sonda(plik)
        cw, ch, _, _ = obraz.kadr(inf, {"zoom": 1})
        print(f"{k}: {plik.name}  {inf['w']}x{inf['h']}, {inf['dl']:.1f} s, {inf['kl']} kl./s, głos: {'tak' if inf['glos'] else 'nie'}, HDR: {'tak' if inf['trc'] in ('arib-std-b67', 'smpte2084') else 'nie'}, kadr 9:16: {cw}x{ch}")
        for i, u in enumerate((.1, .5, .9)):
            N.ff("-ss", f"{inf['dl'] * u:.2f}", "-i", plik, "-frames:v", 1, "-vf", "scale=-2:720", P / "podglad" / f"{k}_{i}.jpg")
    print("Klatki w", P / "podglad")


def pobierz(a):
    P = N.projekt(a.projekt)
    import yt_dlp
    with yt_dlp.YoutubeDL({"outtmpl": str(P / "materialy" / "%(id)s.%(ext)s"), "format": "bv*[height<=1080]+ba/b", "merge_output_format": "mp4",
                           "ffmpeg_location": os.path.dirname(N.program("ffmpeg"))}) as y:
        i = y.extract_info(a.url)
        print(P / "materialy" / f"{i['id']}.mp4")


def strona(a):
    import base64, time
    import render
    b = render.Browser()
    try:
        b.call("Emulation.setDeviceMetricsOverride", width=375, height=812, deviceScaleFactor=2.88, mobile=True)
        b.call("Page.enable")
        b.call("Page.navigate", url=a.url)
        for _ in range(200):
            if b.js("document.readyState") == "complete":
                break
            time.sleep(.1)
        time.sleep(2.5)
        # zgody na ciasteczka: tylko niezbędne, nic nie akceptujemy za użytkownika
        b.js("""(() => { const want = /tylko niezbędne|odrzuć|odrzuc|reject|necessary only|zamknij/i;
          for (const el of document.querySelectorAll('button, a')) if (want.test(el.textContent || '')) { el.click(); return; } })()""")
        time.sleep(1)
        b.js("window.scrollTo(0, document.body.scrollHeight); new Promise(r => setTimeout(r, 1200))")
        b.js("window.scrollTo(0, 0); new Promise(r => setTimeout(r, 600))")
        h = int(b.call("Page.getLayoutMetrics")["cssContentSize"]["height"])
        r = b.call("Page.captureScreenshot", format="png", captureBeyondViewport=True, clip={"x": 0, "y": 0, "width": 375, "height": h, "scale": 1})
        pathlib.Path(a.plik).write_bytes(base64.b64decode(r["data"]))
        print("zapisane", a.plik, "wysokość", h, "px")
    finally:
        b.close()


def klatki(a):
    P = N.projekt(a.projekt)
    dur = json.loads((P / "timing.json").read_text(encoding="utf-8"))["DUR"]
    st = P / "stills"
    shutil.rmtree(st, ignore_errors=True)
    czasy = [round(i * a.co, 2) for i in range(int(dur / a.co) + 1)]
    subprocess.run([sys.executable, str(N.SILNIK / "render.py"), str(P / "rolka.html"), str(st), "--stills", ",".join(map(str, czasy))], check=True)
    (P / "chk").mkdir(exist_ok=True)
    lst = P / "chk" / "lista.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\nduration 0.1\n" for p in sorted(st.glob("*.png"))), encoding="utf-8")
    wiersze = (len(czasy) + 7) // 8
    N.ff("-f", "concat", "-safe", "0", "-i", lst, "-vf", f"scale=216:384,tile=8x{wiersze}:padding=4:color=white", "-frames:v", 1, "-q:v", 3, P / "chk" / "sheet.jpg")
    print(f"{len(czasy)} klatek w {st}, arkusz: {P / 'chk' / 'sheet.jpg'}")


def render_film(a):
    P = N.projekt(a.projekt)
    dur = json.loads((P / "timing.json").read_text(encoding="utf-8"))["DUR"]
    v = P / "video.mp4"
    n = a.workers or max(1, min(4, (os.cpu_count() or 4) // 2))
    subprocess.run([sys.executable, str(N.SILNIK / "render.py"), str(P / "rolka.html"), str(v), "--sub", "2", "--workers", str(n), "--end", f"{dur:.2f}"], check=True)
    out = P / f"{P.name}.mp4"
    N.ff("-i", v, "-i", P / "audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out)
    v.unlink()
    print("gotowe:", out)


def kontrola(a):
    import kontrola as K
    p = pathlib.Path(a.co).expanduser()
    if not p.is_file():
        P = N.projekt(a.co)
        p = P / f"{P.name}.mp4"
    return K.mp4(p, a.maks)


def main():
    N.utf8()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = ap.add_subparsers(dest="cmd", required=True)
    s.add_parser("sprawdz").set_defaults(f=sprawdz)
    p = s.add_parser("nowa"); p.add_argument("nazwa"); p.add_argument("pliki", nargs="*"); p.set_defaults(f=nowa)
    p = s.add_parser("info"); p.add_argument("projekt"); p.set_defaults(f=info)
    p = s.add_parser("pobierz"); p.add_argument("url"); p.add_argument("projekt"); p.set_defaults(f=pobierz)
    p = s.add_parser("strona"); p.add_argument("url"); p.add_argument("plik"); p.set_defaults(f=strona)
    p = s.add_parser("transkrypcja"); p.add_argument("projekt"); p.add_argument("--model", default="small"); p.add_argument("--jezyk", default="pl")
    p.set_defaults(f=lambda a: __import__("transkrypcja").uruchom(N.projekt(a.projekt), a.model, a.jezyk))
    p = s.add_parser("lektor"); p.add_argument("projekt"); p.set_defaults(f=lambda a: __import__("lektor").uruchom(N.projekt(a.projekt)))
    p = s.add_parser("buduj"); p.add_argument("projekt"); p.set_defaults(f=lambda a: __import__("obraz").uruchom(N.projekt(a.projekt)))
    p = s.add_parser("klatki"); p.add_argument("projekt"); p.add_argument("--co", type=float, default=.5); p.set_defaults(f=klatki)
    p = s.add_parser("dzwiek"); p.add_argument("projekt"); p.set_defaults(f=lambda a: __import__("dzwiek").uruchom(N.projekt(a.projekt)))
    p = s.add_parser("render"); p.add_argument("projekt"); p.add_argument("--workers", type=int); p.set_defaults(f=render_film)
    p = s.add_parser("kontrola"); p.add_argument("co"); p.add_argument("--maks", type=float); p.set_defaults(f=kontrola)
    p = s.add_parser("glos"); p.add_argument("audio"); p.add_argument("tekst"); p.add_argument("--model", default="small")
    p.set_defaults(f=lambda a: __import__("kontrola").glos(a.audio, a.tekst, a.model))
    a = ap.parse_args()
    sys.exit(a.f(a) or 0)


if __name__ == "__main__":
    main()
