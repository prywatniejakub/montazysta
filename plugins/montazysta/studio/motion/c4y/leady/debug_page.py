r"""Debug strony rolki: otwiera ją jak renderer i wykonuje wyrażenie JS.  ..\..\..\runtime\python.exe debug_page.py <page.html> "<js>" """
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import render
render.W, render.H = 1080, 1920
b = render.Browser(0)
try:
    b.open(sys.argv[1])
    b.call("Runtime.enable")
    print(b.js(sys.argv[2]))
finally:
    b.close()
