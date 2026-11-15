r"""YouTube thumbnails (1280x720 PNG) from an HTML page, via headless Edge (motion/render.py).
  ..\..\..\runtime\python.exe thumbshot.py page.html out_dir name=query [name2=query2 ...]
  e.g. thumbshot.py ..\l2s\thumb\thumb.html ..\l2s\thumb t1=v=1 t2=v=2
The page sets window.READY = true once its fonts + images are loaded.
"""
import base64, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", ".."))
import render  # noqa: E402

W, H = 1280, 720


def shoot(page, out_dir, shots, port=9361):
    render.W, render.H = W, H
    b = render.Browser(port)
    try:
        b.call("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=1, mobile=False)
        b.call("Page.enable")
        for name, query in shots:
            url = "file:///" + os.path.abspath(page).replace("\\", "/") + ("?" + query if query else "")
            b.call("Page.navigate", url=url)
            time.sleep(0.3)
            for _ in range(300):
                try:
                    if b.js("window.READY === true && location.search === " + repr("?" + query if query else "")):
                        break
                except Exception:
                    pass
                time.sleep(0.1)
            else:
                raise RuntimeError(f"{name}: page never became READY")
            time.sleep(0.2)
            r = b.call("Page.captureScreenshot", format="png", clip={"x": 0, "y": 0, "width": W, "height": H, "scale": 1})
            out = os.path.join(out_dir, name + ".png")
            open(out, "wb").write(base64.b64decode(r["data"]))
            print("ok", out, os.path.getsize(out) // 1024, "KB")
    finally:
        b.close()


if __name__ == "__main__":
    page, out_dir, *pairs = sys.argv[1:]
    shoot(page, out_dir, [p.split("=", 1) if "=" in p else (p, "") for p in pairs])
