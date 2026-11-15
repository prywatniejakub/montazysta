"""Czcionki Google Fonts (licencja OFL, 0 zł) zapisane lokalnie dla renderu rolek: lib/fonts/*.woff2 + lib/fonts/fonts.css.
    ..\\..\\..\\..\\runtime\\python.exe pobierz.py
"""
import os, re, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
URL = ("https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;600;700;800&family=Instrument+Serif:ital@0;1"
       "&family=DM+Sans:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Archivo:wght@500;700;800"
       "&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=block&subset=latin-ext")


def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=30).read()


css = get(URL).decode("utf-8")
out = []
for blok in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*{[^}]*})", css):
    subset, face = blok
    if subset not in ("latin", "latin-ext"):
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", face).group(1).replace(" ", "")
    wg = re.search(r"font-weight:\s*(\d+)", face).group(1)
    st = re.search(r"font-style:\s*(\w+)", face).group(1)
    url = re.search(r"url\((https://[^)]+)\)", face).group(1)
    nazwa = f"{fam}-{wg}{'i' if st == 'italic' else ''}-{subset}.woff2"
    p = os.path.join(HERE, nazwa)
    if not os.path.exists(p):
        open(p, "wb").write(get(url))
    out.append(face.replace(url, nazwa))
open(os.path.join(HERE, "fonts.css"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print(len(out), "krojów")
