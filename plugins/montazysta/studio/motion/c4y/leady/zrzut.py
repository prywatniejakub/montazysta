r"""Zrzut fragmentu strony w widoku telefonu.  ..\..\..\runtime\python.exe zrzut.py <url> <selector> <out.jpg>"""
import os, sys, base64, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ekr"))
import capture
b = capture.open_page(sys.argv[1])
try:
    b.js(f"document.querySelector({sys.argv[2]!r}).scrollIntoView({{block: 'start'}})"); time.sleep(.5)
    r = b.call("Page.captureScreenshot", format="jpeg", quality=85)
    open(sys.argv[3], "wb").write(base64.b64decode(r["data"]))
finally:
    b.close()
