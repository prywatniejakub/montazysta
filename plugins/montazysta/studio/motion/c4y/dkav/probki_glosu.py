r"""Próbki dojrzalszych głosów kobiecych do awatarki Dobre Krzesła (2026-10-06: Weronika za dziewczęca).
  ..\..\..\runtime\python.exe probki_glosu.py   -> glosy/<nazwa>/voice_t.mp3 + glosy/probki.mp3 (wszystkie po kolei)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib")); sys.path.insert(0, os.path.join(HERE, "..", "schrony"))
import c4ykit

V = {"1_Magdalena": "N0GCuK2B0qwWozQNTS8F", "2_Anita": "k57R6Grdv9LrYgiz4ga2", "3_Alicja": "ldzFbnOs5w23MLcNBXQx", "4_Lena": "d26eMDXtCFizSzBVHFFS"}
TXT = ["Zanim kupisz krzesła do jadalni, zobacz, gdzie się je szyje.", "Siedzę na krześle Westa. Zobacz je w prawdziwej jadalni, nie w katalogu."]
out = os.path.join(HERE, "glosy"); os.makedirs(out, exist_ok=True)
for n, vid in V.items():
    d = os.path.join(out, n); os.makedirs(d, exist_ok=True)
    c4ykit.kit.tighten(d, TXT, voice_id=vid)
    c4ykit.run(["-i", os.path.join(d, "voice_t.mp3"), "-c:a", "libmp3lame", "-q:a", "2", os.path.join(out, f"Glos {n}.mp3")])
print("gotowe", out)
