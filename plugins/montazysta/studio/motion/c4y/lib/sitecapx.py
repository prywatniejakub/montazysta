r"""Jak sitecap.py, ale dodatkowo zapisuje <out>.json: prostokąty (px strony telefonu 375) elementów z krótkim tekstem
(przyciski, linki, filtry, nagłówki), żeby w rolce trafiać palcem i podświetleniem w prawdziwe miejsca.
  ..\..\runtime\python.exe c4y\lib\sitecapx.py <url> <out.png> [--width 375] [--scale 2.88]
"""
import argparse, base64, json, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
import render  # noqa: E402

RECTS = r"""(() => { const out = [];
  for (const e of document.querySelectorAll('a, button, label, h1, h2, h3, h4, select, input, span, p, li, div')) {
    const t = (e.innerText || e.value || e.placeholder || '').trim().replace(/\s+/g, ' ');
    if (!t || t.length > 60) continue;
    if (e.tagName === 'DIV' && e.children.length > 2) continue;
    const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
    out.push([e.tagName.toLowerCase(), t, Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]);
  } return out; })()"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("out")
    ap.add_argument("--width", type=int, default=375); ap.add_argument("--scale", type=float, default=2.88)
    ap.add_argument("--height", type=int, default=812)
    ap.add_argument("--js", default="", help="wyrażenie JS uruchamiane tuż przed zrzutem (np. przewinięcie karuzeli)")
    ap.add_argument("--maxh", type=int, default=0, help="zrzut tylko górnych N px strony")
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
        if a.js:
            b.js(a.js); time.sleep(.8)
        rects = b.js(RECTS)
        m = b.call("Page.getLayoutMetrics")
        h = int(m["cssContentSize"]["height"])
        if a.maxh:
            h = min(h, a.maxh)
        r = b.call("Page.captureScreenshot", format="png", captureBeyondViewport=True,
                   clip={"x": 0, "y": 0, "width": a.width, "height": h, "scale": 1})
        open(a.out, "wb").write(base64.b64decode(r["data"]))
        json.dump(rects, open(os.path.splitext(a.out)[0] + ".json", "w", encoding="utf-8"), ensure_ascii=False)
        print("zapisane", a.out, "wysokość strony", h, "px,", len(rects), "elementów")
    finally:
        b.close() if hasattr(b, "close") else b.proc.kill()


if __name__ == "__main__":
    main()
