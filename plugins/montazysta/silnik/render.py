"""Render klatka po klatce: strona HTML -> Chrome bez okna (CDP) -> FFmpeg.

Strona udostępnia window.render(t) (sekundy) i window.READY.
  render.py strona.html wynik.mp4 --fps 30 --sub 2 --end 24.5 [--stills 1,2.5,...]
--sub N liczy N podklatek na klatkę w migawce 180 stopni i uśrednia je (prawdziwe rozmycie ruchu).
"""
import argparse, base64, json, os, pathlib, subprocess, sys, tempfile, time, urllib.request, shutil

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import websocket  # noqa: E402
import narzedzia as N  # noqa: E402

W, H = 1080, 1920


class Browser:
    def __init__(self):
        # port 0 = przeglądarka sama bierze wolny port i zapisuje go w SWOIM profilu: dwa rendery naraz nigdy nie pomieszają klatek
        self.prof = tempfile.mkdtemp(prefix="montazysta-")
        self.proc = subprocess.Popen([
            N.przegladarka(), "--headless=new", "--remote-debugging-port=0",
            f"--user-data-dir={self.prof}", "--hide-scrollbars", "--mute-audio",
            "--force-device-scale-factor=1", f"--window-size={W},{H}",
            "--allow-file-access-from-files", "--disable-extensions",
            "--no-first-run", "--no-default-browser-check", "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
            "--enable-gpu-rasterization", "--ignore-gpu-blocklist", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        act = os.path.join(self.prof, "DevToolsActivePort")
        for _ in range(600):
            try:
                port = int(open(act).read().split()[0]); break
            except Exception:
                time.sleep(0.05)
        else:
            raise RuntimeError("przeglądarka nie podała portu (DevToolsActivePort)")
        for _ in range(200):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list"))
                page = next(t for t in tabs if t["type"] == "page")
                break
            except Exception:
                time.sleep(0.1)
        self.ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=180, suppress_origin=True)
        self.n = 0

    def call(self, method, **params):
        self.n += 1
        self.ws.send(json.dumps({"id": self.n, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.n:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg["result"]

    def js(self, expr):
        r = self.call("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True)
        if "exceptionDetails" in r:
            raise RuntimeError(json.dumps(r["exceptionDetails"])[:800])
        return r["result"].get("value")

    def open(self, path):
        self.call("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=1, mobile=False)
        self.call("Page.enable")
        self.call("Page.navigate", url=pathlib.Path(path).resolve().as_uri() + "?render")
        for _ in range(1800):  # strony z 2-3 tys. klatek przy zimnym starcie ładują się ponad minutę
            try:
                if self.js("window.READY === true"):
                    return
            except Exception:
                pass
            time.sleep(0.1)
        raise RuntimeError("strona nie osiągnęła READY")

    def shot(self, t, fmt="jpeg"):
        self.js(f"window.render({t:.6f})")
        kw = {"quality": 98} if fmt == "jpeg" else {}
        r = self.call("Page.captureScreenshot", format=fmt, optimizeForSpeed=True,
                      clip={"x": 0, "y": 0, "width": W, "height": H, "scale": 1}, **kw)
        return base64.b64decode(r["data"])

    def close(self):
        try:
            self.ws.close()
        finally:
            self.proc.kill()
            self.proc.wait()
            shutil.rmtree(self.prof, ignore_errors=True)


def times(f0, f1, fps, sub):
    out = []
    for i in range(f0, f1):
        for k in range(sub):
            off = ((k + 0.5) / sub - 0.5) * (0.5 / fps) if sub > 1 else 0.0  # migawka 180 stopni wokół czasu klatki
            out.append(max(0.0, i / fps + off))  # nigdy t < 0: klatka 0 nie może się mieszać z pustą stroną
    return out


def encode(page, out, f0, f1, fps, sub, crf):
    b = Browser()
    try:
        b.open(page)
        vf = []
        if sub > 1:
            vf += [f"tmix=frames={sub}", f"select='eq(mod(n\\,{sub})\\,{sub - 1})'", f"setpts=N/{fps}/TB"]
        vf += ["format=yuv420p"]
        ff = subprocess.Popen([N.program("ffmpeg"), "-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg",
                               "-framerate", str(fps * sub), "-i", "-", "-vf", ",".join(vf),
                               "-r", str(fps), "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
                               "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
        ts = times(f0, f1, fps, sub)
        t0 = time.time()
        for i, t in enumerate(ts):
            ff.stdin.write(b.shot(t))
            if i % 120 == 0:
                el = time.time() - t0
                print(f"{i}/{len(ts)}  t={t:.2f}  {el:.0f}s  zostało ok. {el / (i + 1) * (len(ts) - i - 1):.0f}s", flush=True)
        ff.stdin.close()
        ff.wait()
    finally:
        b.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("page"); ap.add_argument("out")
    ap.add_argument("--fps", type=int, default=N.FPS)
    ap.add_argument("--sub", type=int, default=2)
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--end", type=float, default=None)
    ap.add_argument("--crf", type=int, default=18)
    ap.add_argument("--stills", default="")
    ap.add_argument("--workers", type=int, default=1)
    ap.add_argument("--frames", default="")  # wewnętrzne: "f0:f1" dla jednego procesu
    a = ap.parse_args()
    if a.stills:
        b = Browser()
        try:
            b.open(a.page)
            os.makedirs(a.out, exist_ok=True)
            for s in a.stills.split(","):
                t = float(s)
                with open(os.path.join(a.out, f"s{t:06.2f}.png"), "wb") as f:
                    f.write(b.shot(t, "png"))
        finally:
            b.close()
        return
    if a.frames:
        f0, f1 = map(int, a.frames.split(":"))
        encode(a.page, a.out, f0, f1, a.fps, a.sub, a.crf)
        return
    end = a.end
    F0, F1 = int(round(a.start * a.fps)), int(round(end * a.fps))
    n = a.workers
    cuts = [F0 + (F1 - F0) * k // n for k in range(n + 1)]
    parts, procs = [], []
    t0 = time.time()
    for k in range(n):
        part = f"{os.path.splitext(a.out)[0]}.part{k}.mp4"
        parts.append(part)
        procs.append(subprocess.Popen([sys.executable, __file__, a.page, part, "--fps", str(a.fps), "--sub", str(a.sub),
                                       "--crf", str(a.crf), "--frames", f"{cuts[k]}:{cuts[k + 1]}"]))
    codes = [p.wait() for p in procs]
    if any(codes):
        raise SystemExit(f"render nieudany: {codes}")
    lst = os.path.splitext(a.out)[0] + ".parts.txt"
    with open(lst, "w", encoding="utf-8") as f:
        f.writelines(f"file '{pathlib.Path(p).resolve().as_posix()}'\n" for p in parts)
    N.ff("-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", a.out)
    for p in parts:
        os.remove(p)
    os.remove(lst)
    print(f"gotowe {a.out} w {time.time() - t0:.0f} s", flush=True)


if __name__ == "__main__":
    main()
