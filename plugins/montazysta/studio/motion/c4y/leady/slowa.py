r"""Słowa z czasami z pliku scribe w podanych zakresach.  ..\..\..\runtime\python.exe slowa.py <plik.scribe.json> a-b [a-b ...]"""
import json, sys
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(sys.argv[1], encoding="utf-8"))
for r in sys.argv[2:]:
    a, b = map(float, r.split("-"))
    print("---", r)
    print(" ".join(f"{w['text']}[{w['start']:.2f}-{w['end']:.2f}]" for w in d["words"] if w.get("type") == "word" and a <= w["start"] <= b))
