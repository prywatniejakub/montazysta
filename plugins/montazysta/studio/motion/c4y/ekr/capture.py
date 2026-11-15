r"""Nagranie strony klienta w widoku telefonu (1080x1920, 30 kl./s) jako przebitki do rolek: ekredytonline.pl (Andrzej, 2026-10-05).
Headless Edge (motion/render.py Browser, port 0), emulacja telefonu 390x693 @2.77, cookies: „Odrzuć wszystkie”, widżet dostępności ukryty.
  ..\..\..\runtime\python.exe capture.py probe <url>                 -> pozycje nagłówków ofert (y w px CSS)
  ..\..\..\runtime\python.exe capture.py shot <name> <url> <y0> <y1> <sek>  -> ../clips/<name>/NNN.jpg (płynne przewijanie y0 -> y1)
"""
import os, sys, json, time, base64, math
HERE = os.path.dirname(os.path.abspath(__file__))
MOTION = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, MOTION)
sys.path.insert(0, os.path.join(HERE, "..", "schrony"))
import render
CLIPS = os.path.join(HERE, "..", "clips")
UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36"
CW, CH = 390, 693


def open_page(url):
    b = render.Browser(0)
    b.call("Emulation.setDeviceMetricsOverride", width=CW, height=CH, deviceScaleFactor=1080 / CW, mobile=True)
    b.call("Emulation.setUserAgentOverride", userAgent=UA)
    b.call("Page.enable")
    b.call("Page.navigate", url=url)
    for _ in range(100):
        time.sleep(.2)
        try:
            if b.js("document.readyState") == "complete": break
        except Exception: pass
    time.sleep(1.0)
    # cookies: najbardziej prywatna opcja; widżet dostępności i pasek cookies chowamy z obrazu
    b.js("""(() => { const bt = [...document.querySelectorAll('button,a')].find(x => /Odrzuć wszystkie/i.test(x.textContent)); if (bt) bt.click();
      [...document.querySelectorAll('body *')].forEach(e => { const cs = getComputedStyle(e); const c = (e.className || '').toString() + ' ' + e.id;
        if ((cs.position === 'fixed' || cs.position === 'sticky') && /(onetap|cky|cookie|consent)/i.test(c)) e.style.setProperty('display', 'none', 'important'); });
      return !!bt; })()""")
    # doładuj leniwe obrazki
    h = b.js("document.documentElement.scrollHeight")
    for y in range(0, int(h), 500):
        b.js(f"window.scrollTo(0,{y})"); time.sleep(.08)
    b.js("window.scrollTo(0,0)"); time.sleep(.6)
    return b


def probe(url):
    b = open_page(url)
    try:
        print(b.js("""JSON.stringify([...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 50 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).map(e => [e.tagName, e.id, e.className.toString().slice(0,60), e.scrollHeight, e.clientHeight]))"""))
        print(b.js("""JSON.stringify([...document.querySelectorAll('h1,h2,h3')].slice(0,12).map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), getComputedStyle(e).display, e.textContent.trim().slice(0,50)]; }))"""))
        r = b.call("Page.captureScreenshot", format="jpeg", quality=80)
        open(os.path.join(HERE, "_probe.jpg"), "wb").write(base64.b64decode(r["data"]))
    finally:
        b.close()


def shot(name, url, y0, y1, secs, fps=30):
    b = open_page(url)
    d = os.path.join(CLIPS, name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    n = int(round(secs * fps))
    try:
        for i in range(n):
            u = i / max(1, n - 1); e = .5 - .5 * math.cos(math.pi * u)
            b.js(f"window.scrollTo(0,{y0 + (y1 - y0) * e:.1f})")
            b.js("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            r = b.call("Page.captureScreenshot", format="jpeg", quality=88)
            open(os.path.join(d, f"{i + 1:03d}.jpg"), "wb").write(base64.b64decode(r["data"]))
    finally:
        b.close()
    import pano
    pano.manifest_update({name: n})
    print(name, n)


def focus(name, url, needle, secs, zoom=1.4, fps=30):
    """zbliżenie jednej karty: nagłówek z tekstem `needle` na 40% wysokości, strona powiększona (zoom), lekki dryf w górę"""
    b = open_page(url)
    d = os.path.join(CLIPS, name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    n = int(round(secs * fps))
    try:
        b.js(f"document.body.style.zoom = {zoom}")
        y = b.js(f"""(() => {{ const h = [...document.querySelectorAll('h3, .offer-title, a, span, div, p, li')].find(e => e.children.length === 0 && e.textContent.includes({json.dumps(needle)}) && e.getBoundingClientRect().height > 0);
          if (!h) return -1; const card = h.closest('[class*=offer], [class*=card], article, li') || h; const r = card.getBoundingClientRect(); return r.top + scrollY + r.height * .5 - innerHeight * .5; }})()""")
        if y is None or y < 0: raise RuntimeError("nie znaleziono: " + needle)
        for i in range(n):
            u = i / max(1, n - 1)
            b.js(f"window.scrollTo(0,{y - 25 + 50 * u:.1f})")
            b.js("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            r = b.call("Page.captureScreenshot", format="jpeg", quality=88)
            open(os.path.join(d, f"{i + 1:03d}.jpg"), "wb").write(base64.b64decode(r["data"]))
    finally:
        b.close()
    import pano
    pano.manifest_update({name: n})
    print(name, n)


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "focus": focus(a[1], a[2], a[3], float(a[4]), float(a[5]) if len(a) > 5 else 1.4)
    elif a[0] == "probe": probe(a[1])
    elif a[0] == "shot": shot(a[1], a[2], float(a[3]), float(a[4]), float(a[5]))
