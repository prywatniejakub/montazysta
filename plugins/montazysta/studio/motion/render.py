"""Frame-exact renderer: HTML motion page -> headless Edge (CDP) -> FFmpeg.

The page must expose window.render(t) (seconds) and window.READY.
  render.py page.html out.mp4 --fps 60 --sub 3 --start 0 --end 24.5 [--stills 1,2.5,...]
--cpu: raster programowy (wolniej, bit w bit powtarzalny; bramka efektów motion/efekty/probka.py).
--sub N renders N subframes per output frame spread over a 180-degree shutter
and averages them (real motion blur).
"""
import argparse, atexit, base64, json, os, subprocess, sys, time, urllib.request, shutil, tempfile

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path.insert(0, os.path.join(ROOT, "app", "vendor"))
import websocket  # noqa: E402

def _c4y_browser():
    """Chrome / Chromium / Edge: najpierw C4Y_CHROME, potem Mac, potem Chromium Montażysty, na końcu Edge z Windowsa."""
    import glob, shutil
    for k in [os.environ.get("C4Y_CHROME"), "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
              r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              shutil.which("google-chrome"), shutil.which("chromium")]:
        if k and os.path.exists(k):
            return k
    dom = os.environ.get("MONTAZYSTA_DOM") or os.path.expanduser("~/.montazysta")
    for wzor in ("**/Google Chrome for Testing", "**/Chromium", "**/chrome"):
        for p in glob.glob(os.path.join(dom, "chromium", wzor), recursive=True):
            if os.path.isfile(p) and os.access(p, os.X_OK):
                return p
    raise SystemExit("Brak przeglądarki Chrome. Zainstaluj Chrome albo uruchom instalację Montażysty.")


EDGE = _c4y_browser()
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
W, H = 1920, 1080


def free_port(want):
    """2026-10-05: kilka renderów naraz (inne aplikacje/sesje) na tym samym porcie = jeden łączy się z przeglądarką drugiego
    i klatki się mieszają. Bierzemy żądany port tylko, gdy nikt na nim nie słucha, inaczej następny wolny."""
    import socket
    for p in list(range(want, want + 400)) + [0]:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("127.0.0.1", p))
            port = s.getsockname()[1]
        except OSError:
            continue
        finally:
            s.close()
        c = socket.socket(socket.AF_INET, socket.SOCK_STREAM); c.settimeout(.2)
        busy = c.connect_ex(("127.0.0.1", port)) == 0
        c.close()
        if not busy:
            return port
    raise RuntimeError("brak wolnego portu")


# 2026-11-14: sprzątanie po Edge. proc.kill() zabijał tylko główny msedge.exe, a jego procesy potomne (gpu, renderer,
# crashpad...) żyły dalej jako sieroty i trzymały pliki profilu, więc rmtree(ignore_errors=True) po cichu nic nie usuwał.
# Do tego skrypty, które nie wołały close() albo się wysypały / były przerywane, zostawiały całą przeglądarkę.
# Efekt: 71 folderów edge-motion-* (~13 GB) w Temp i 472 wiszące procesy Edge po dwóch dniach renderów.
# Teraz: Edge startuje w Job Object z KILL_ON_JOB_CLOSE (zamknięcie uchwytu / śmierć Pythona = koniec całego drzewa),
# close() zabija całe drzewo, czeka na zwolnienie plików i dopiero usuwa profil, a atexit domyka zapomniane przeglądarki.
def _kill_on_close_job():
    """Job Object, który przy zamknięciu uchwytu (także gdy Python zginie) zabija wszystkie swoje procesy. None = brak."""
    if os.name != "nt":
        return None
    try:
        import ctypes
        from ctypes import wintypes

        class BASIC(ctypes.Structure):
            _fields_ = [("PerProcessUserTimeLimit", ctypes.c_int64), ("PerJobUserTimeLimit", ctypes.c_int64),
                        ("LimitFlags", wintypes.DWORD), ("MinimumWorkingSetSize", ctypes.c_size_t),
                        ("MaximumWorkingSetSize", ctypes.c_size_t), ("ActiveProcessLimit", wintypes.DWORD),
                        ("Affinity", ctypes.c_size_t), ("PriorityClass", wintypes.DWORD),
                        ("SchedulingClass", wintypes.DWORD)]

        class EXT(ctypes.Structure):
            _fields_ = [("BasicLimitInformation", BASIC), ("IoInfo", ctypes.c_ulonglong * 6),
                        ("ProcessMemoryLimit", ctypes.c_size_t), ("JobMemoryLimit", ctypes.c_size_t),
                        ("PeakProcessMemoryUsed", ctypes.c_size_t), ("PeakJobMemoryUsed", ctypes.c_size_t)]

        k32 = ctypes.WinDLL("kernel32", use_last_error=True)
        k32.CreateJobObjectW.restype = wintypes.HANDLE
        k32.CreateJobObjectW.argtypes = [ctypes.c_void_p, wintypes.LPCWSTR]
        k32.SetInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
        job = k32.CreateJobObjectW(None, None)
        if not job:
            return None
        info = EXT()
        info.BasicLimitInformation.LimitFlags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not k32.SetInformationJobObject(job, 9, ctypes.byref(info), ctypes.sizeof(info)):  # 9 = ExtendedLimitInformation
            k32.CloseHandle(wintypes.HANDLE(job))
            return None
        return job
    except Exception:
        return None


def _job_assign_resume(job, proc):
    """Proces uruchomiony z CREATE_SUSPENDED: wrzuć go do joba ZANIM zdąży odpalić dzieci, potem wznów.
    Zwraca False, gdy przypisanie się nie udało (proces i tak zostaje wznowiony)."""
    import ctypes
    from ctypes import wintypes
    k32 = ctypes.WinDLL("kernel32", use_last_error=True)
    k32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    nt = ctypes.WinDLL("ntdll")
    nt.NtResumeProcess.argtypes = [wintypes.HANDLE]
    h = wintypes.HANDLE(int(proc._handle))
    try:
        return bool(k32.AssignProcessToJobObject(wintypes.HANDLE(job), h))
    finally:
        nt.NtResumeProcess(h)


def _popen_in_job(job, args, **kw):
    """Popen, którego proces (i wszystko, co on odpali) ginie razem z jobem. Bez joba = zwykły Popen."""
    if not job:
        return subprocess.Popen(args, **kw)
    p = subprocess.Popen(args, creationflags=kw.pop("creationflags", 0) | 0x4, **kw)  # 0x4 = CREATE_SUSPENDED
    _job_assign_resume(job, p)
    return p


def _sweep_stale_profiles():
    """Usuwa profile edge-motion-* po renderach ubitych na twardo (wtedy close() się nie wykonuje).
    Działający Edge trzyma plik 'lockfile' w profilu otwarty na wyłączność, więc profil, z którego da się
    usunąć lockfile, nie jest używany. Świeże foldery (<2 min) pomijamy: Edge mógł jeszcze nie wystartować."""
    tmp = tempfile.gettempdir()
    try:
        names = [n for n in os.listdir(tmp) if n.startswith("edge-motion-")]
    except OSError:
        return
    for n in names:
        d = os.path.join(tmp, n)
        try:
            st = os.stat(d)  # data UTWORZENIA (mtime odświeża się przy każdej próbie usuwania)
            if time.time() - getattr(st, "st_birthtime", st.st_ctime) < 120:
                continue
            lock = os.path.join(d, "lockfile")
            if os.path.exists(lock):
                os.remove(lock)  # PermissionError = przeglądarka żyje -> zostawiamy
        except OSError:
            continue
        shutil.rmtree(d, ignore_errors=True)


def _job_terminate_close(job):
    import ctypes
    from ctypes import wintypes
    k32 = ctypes.WinDLL("kernel32", use_last_error=True)
    k32.TerminateJobObject.argtypes = [wintypes.HANDLE, wintypes.UINT]
    k32.CloseHandle.argtypes = [wintypes.HANDLE]
    k32.TerminateJobObject(wintypes.HANDLE(job), 1)
    k32.CloseHandle(wintypes.HANDLE(job))


class Browser:
    def __init__(self, port, cpu=False):
        self.prof = self.proc = self.ws = self.job = None
        self._closed = False
        atexit.register(self.close)  # skrypty, które nie wołają close() albo się wysypią, nie zostawią przeglądarki
        try:
            self._start(port, cpu)
        except BaseException:
            self.close()
            raise

    def _start(self, port, cpu):
        # 2026-10-05: port 0 = przeglądarka sama bierze wolny port i zapisuje go w SWOIM profilu (DevToolsActivePort).
        # Stałe porty (9333...) przy kilku renderach naraz (inne aplikacje / workery) łączyły się z cudzą przeglądarką -> pomieszane klatki.
        # 2026-11-10: cpu=True = raster programowy. Raster GPU nie jest bit w bit powtarzalny (te same klatki przy dwóch renderach
        # naraz albo w innej kolejności różniły się o 1-2 poziomy na krawędziach cyfr), więc bramka deterministyczności efektów
        # (motion/efekty/probka.py) renderuje z --cpu. Domyślnie bez zmian (GPU, szybciej).
        gpu = ["--disable-gpu-rasterization", "--disable-gpu"] if cpu else ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"]
        _sweep_stale_profiles()
        self.prof = tempfile.mkdtemp(prefix="edge-motion-")
        self.job = _kill_on_close_job()
        self.proc = _popen_in_job(self.job, [
            EDGE, "--headless=new", "--remote-debugging-port=0",
            f"--user-data-dir={self.prof}", "--hide-scrollbars", "--mute-audio",
            "--force-device-scale-factor=1", f"--window-size={W},{H}",
            "--allow-file-access-from-files", "--disable-extensions",
            "--no-first-run", "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding"] + gpu + ["about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        act = os.path.join(self.prof, "DevToolsActivePort")
        for _ in range(300):
            try:
                port = int(open(act).read().split()[0]); break
            except Exception:
                time.sleep(0.05)
        else:
            raise RuntimeError("przeglądarka nie podała portu (DevToolsActivePort)")
        self.port = port
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list"))
                page = next(t for t in tabs if t["type"] == "page")
                if page.get("url") != "about:blank":  # to nie nasza (świeża) przeglądarka: cudzy render na tym porcie
                    raise SystemExit(f"port {port}: przeglądarka innego renderu ({page.get('url', '')[:80]}), przerywam")
                break
            except SystemExit:
                raise
            except Exception:
                time.sleep(0.1)
        self.ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=120,
                                              suppress_origin=True)
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
        url = "file:///" + os.path.abspath(path).replace("\\", "/") + "?render"
        self.call("Page.navigate", url=url)
        for _ in range(900):  # 2026-10-07: pages with ~2-3k clip frames sometimes need >30 s on a cold cache
            try:
                if self.js("window.READY === true"):
                    return
            except Exception:
                pass
            time.sleep(0.1)
        raise RuntimeError("page never became READY")

    def shot(self, t, fmt="jpeg"):
        self.js(f"window.render({t:.6f})")
        kw = {"quality": 98} if fmt == "jpeg" else {}
        r = self.call("Page.captureScreenshot", format=fmt, optimizeForSpeed=True,
                      clip={"x": 0, "y": 0, "width": W, "height": H, "scale": 1}, **kw)
        return base64.b64decode(r["data"])

    def close(self):
        if self._closed:
            return
        self._closed = True
        try:
            if self.ws:
                self.ws.close()
        except Exception:
            pass
        if self.job:  # zabija CAŁE drzewo Edge (gpu, renderery, crashpad), nie tylko główny proces
            _job_terminate_close(self.job)
            self.job = None
        if self.proc:
            if self.proc.poll() is None and os.name == "nt":
                subprocess.run(["taskkill", "/T", "/F", "/PID", str(self.proc.pid)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                self.proc.kill()
            except OSError:
                pass
            try:
                self.proc.wait(timeout=15)
            except subprocess.TimeoutExpired:
                pass
        if self.prof:
            for _ in range(40):  # pliki profilu zwalniają się chwilę po śmierci procesów
                shutil.rmtree(self.prof, ignore_errors=True)
                if not os.path.exists(self.prof):
                    break
                time.sleep(0.25)
            else:
                print(f"UWAGA: nie udało się usunąć profilu Edge {self.prof}", file=sys.stderr, flush=True)


def times(f0, f1, fps, sub):
    out = []
    for i in range(f0, f1):
        for k in range(sub):
            # 180-degree shutter centred on the frame time
            off = ((k + 0.5) / sub - 0.5) * (0.5 / fps) if sub > 1 else 0.0
            out.append(max(0.0, i / fps + off))  # 2026-09-26: never t < 0 (frame 0 was half blended with an empty page)
    return out


def encode(page, out, f0, f1, fps, sub, port, crf, cpu=False):
    b = Browser(port, cpu)
    try:
        b.open(page)
        vf = []
        if sub > 1:
            vf += [f"tmix=frames={sub}", f"select='eq(mod(n\\,{sub})\\,{sub - 1})'", f"setpts=N/{fps}/TB"]
        vf += ["format=yuv420p"]
        ff = subprocess.Popen([FF, "-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg",
                               "-framerate", str(fps * sub), "-i", "-", "-vf", ",".join(vf),
                               "-r", str(fps), "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
                               "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
        ts = times(f0, f1, fps, sub)
        t0 = time.time()
        for i, t in enumerate(ts):
            ff.stdin.write(b.shot(t))
            if i % 60 == 0:
                el = time.time() - t0
                print(f"[{port}] {i}/{len(ts)}  t={t:.2f}  {el:.0f}s  eta {el / (i + 1) * (len(ts) - i - 1):.0f}s",
                      flush=True)
        ff.stdin.close()
        ff.wait()
    finally:
        b.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("page")
    ap.add_argument("out")
    ap.add_argument("--fps", type=int, default=60)
    ap.add_argument("--sub", type=int, default=1)
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--end", type=float, default=None)
    ap.add_argument("--port", type=int, default=9333)
    ap.add_argument("--crf", type=int, default=12)
    ap.add_argument("--stills", default="")
    ap.add_argument("--workers", type=int, default=1)
    ap.add_argument("--frames", default="")  # internal: "f0:f1" for one worker
    ap.add_argument("--size", default="1920x1080")
    ap.add_argument("--cpu", action="store_true", help="raster programowy: wolniej, ale bit w bit powtarzalny (bramka efektów)")
    a = ap.parse_args()
    global W, H
    W, H = map(int, a.size.lower().split("x"))
    if a.stills:
        b = Browser(a.port, a.cpu)
        try:
            b.open(a.page)
            os.makedirs(a.out, exist_ok=True)
            for s in a.stills.split(","):
                t = float(s)
                t0 = time.time()
                png = b.shot(t, "png")
                with open(os.path.join(a.out, f"s{t:06.2f}.png"), "wb") as f:
                    f.write(png)
                print(f"still {t:.2f} {time.time() - t0:.2f}s", flush=True)
        finally:
            b.close()
        return
    if a.frames:
        f0, f1 = map(int, a.frames.split(":"))
        encode(a.page, a.out, f0, f1, a.fps, a.sub, a.port, a.crf, a.cpu)
        return
    end = a.end
    if end is None:
        b = Browser(a.port, a.cpu)
        b.open(a.page)
        end = b.js("window.DURATION")
        b.close()
    F0, F1 = int(round(a.start * a.fps)), int(round(end * a.fps))
    n = a.workers
    cuts = [F0 + (F1 - F0) * k // n for k in range(n + 1)]
    parts, procs = [], []
    t0 = time.time()
    wjob = _kill_on_close_job()  # 2026-11-14: ubicie procesu głównego zabija też workery (wcześniej renderowały dalej jako sieroty)
    for k in range(n):
        part = f"{os.path.splitext(a.out)[0]}.part{k}.mp4"
        parts.append(part)
        procs.append(_popen_in_job(wjob, [sys.executable, __file__, a.page, part, "--fps", str(a.fps), "--sub", str(a.sub),
                                       "--crf", str(a.crf), "--port", str(a.port + 1 + k), "--size", a.size,
                                       "--frames", f"{cuts[k]}:{cuts[k + 1]}"] + (["--cpu"] if a.cpu else [])))
    codes = [p.wait() for p in procs]
    if any(codes):
        raise SystemExit(f"worker failed: {codes}")
    lst = os.path.splitext(a.out)[0] + ".parts.txt"
    with open(lst, "w", encoding="utf-8") as f:
        f.writelines(f"file '{os.path.abspath(p)}'\n" for p in parts)
    subprocess.run([FF, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", a.out], check=True)
    for p in parts:
        os.remove(p)
    os.remove(lst)
    print(f"done {a.out} in {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
