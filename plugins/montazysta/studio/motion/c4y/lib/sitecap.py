r"""Zrzut prawdziwej strony klienta jako materiał do rolki (telefon 375 px szerokości, ostrość 1080 px):
cała strona jako jeden wysoki PNG (rolka „przewija” go sama) + opcjonalne pojedyncze widoki.
  ..\..\runtime\python.exe c4y\lib\sitecap.py <url> <out.png> [--width 375] [--scale 2.88] [--click "tekst przycisku"]
"""
import argparse, base64, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
import render  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("out")
    ap.add_argument("--width", type=int, default=375); ap.add_argument("--scale", type=float, default=2.88)
    ap.add_argument("--height", type=int, default=812)
    a = ap.parse_args()
    b = render.Browser(9500)
    try:
        b.call("Emulation.setDeviceMetricsOverride", width=a.width, height=a.height, deviceScaleFactor=a.scale, mobile=True)
        b.call("Emulation.setUserAgentOverride", userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
                                                          "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1")
        b.call("Page.enable")
        b.call("Page.navigate", url=a.url)
        for _ in range(200):
            if b.js("document.readyState") == "complete":
                break
            time.sleep(.1)
        time.sleep(2.5)
        # zgody na ciasteczka: tylko niezbędne / zamknij (nic nie akceptujemy za użytkownika)
        b.js("""(() => { const want = /tylko niezbędne|odrzuć|odrzuc|reject|necessary only|zamknij/i;
          for (const el of document.querySelectorAll('button, a')) if (want.test(el.textContent || '')) { el.click(); return el.textContent; } })()""")
        time.sleep(1)
        b.js("window.scrollTo(0, document.body.scrollHeight); new Promise(r => setTimeout(r, 1200))")
        b.js("window.scrollTo(0, 0); new Promise(r => setTimeout(r, 600))")
        m = b.call("Page.getLayoutMetrics")
        h = int(m["cssContentSize"]["height"])
        r = b.call("Page.captureScreenshot", format="png", captureBeyondViewport=True,
                   clip={"x": 0, "y": 0, "width": a.width, "height": h, "scale": 1})
        open(a.out, "wb").write(base64.b64decode(r["data"]))
        print("zapisane", a.out, "wysokość strony", h, "px")
    finally:
        b.close() if hasattr(b, "close") else b.proc.kill()


if __name__ == "__main__":
    main()
