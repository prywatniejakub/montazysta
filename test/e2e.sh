#!/usr/bin/env bash
# Test od początku do końca na czystej maszynie: nagranie z głosem i lektor, aż do gotowych MP4 i kontroli.
set -euo pipefail

TU="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
R="bash $TU/plugins/montazysta/silnik/rolka"
export MONTAZYSTA_PRACA="${MONTAZYSTA_PRACA:-$TU/test/wynik}"
mkdir -p "$MONTAZYSTA_PRACA/rolki"
FX="$(mktemp -d)"

# nagranie testowe: obraz z generatora, głos z systemu
if command -v say >/dev/null 2>&1; then
  say -o "$FX/glos.aiff" "This is a test of the editing engine. The first sentence is short. The second sentence is a little bit longer than the first one. Clients love short videos with clear captions."
else
  ffmpeg -y -v error -f lavfi -i "sine=f=220:d=12" "$FX/glos.aiff"
fi
ffmpeg -y -v error -f lavfi -i "testsrc2=s=1920x1080:r=30:d=14" -i "$FX/glos.aiff" -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac "$FX/nagranie.mp4"

# Tryb A
$R nowa ta "$FX/nagranie.mp4"
$R info ta
$R transkrypcja ta --jezyk en --model "${MONTAZYSTA_MODEL:-tiny}"
P="$MONTAZYSTA_PRACA/rolki/ta"
"${MONTAZYSTA_DOM:-$HOME/.montazysta}/venv/bin/python" - "$P" <<'EOF'
import json, sys, pathlib
P = pathlib.Path(sys.argv[1])
tr = json.loads((P / "transkrypcja" / "a.json").read_text(encoding="utf-8"))
S = json.loads((P / "rolka.json").read_text(encoding="utf-8"))
S.update({"hak": "TEST<br>SILNIKA", "ujecia": [{"zrodlo": "a", "frag": f["n"]} for f in tr["fragmenty"]],
          "koniec": {"sekundy": 2, "nad": "Koniec", "tytul": "Test", "pod": "Mac", "przycisk": "OK"}})
(P / "rolka.json").write_text(json.dumps(S, ensure_ascii=False), encoding="utf-8")
EOF
$R buduj ta
$R klatki ta --co 1
$R dzwiek ta
$R render ta --workers 2
$R kontrola ta

# Tryb B: darmowy lektor (wymaga internetu)
$R nowa tb "$FX/nagranie.mp4"
P="$MONTAZYSTA_PRACA/rolki/tb"
cat > "$P/rolka.json" <<'EOF'
{"styl": "spokojny", "zrodla": {"a": {"plik": "materialy/nagranie.mp4"}},
 "lektor": {"glos": "zofia", "linie": [
  {"klucz": "g1", "tekst": "Właścicielu firmy, to jest test lektora.", "ujecia": [{"zrodlo": "a", "od": 0}, {"zrodlo": "a", "od": 5, "zoom": 1.2}]},
  {"klucz": "g2", "tekst": "Zażółć gęślą jaźń.", "ujecia": [{"zrodlo": "a", "od": 8}]}]},
 "liczniki": [{"kotwica": "lektora", "z": 0, "na": 400, "sufiks": "ZŁ"}]}
EOF
$R lektor tb
$R buduj tb
$R klatki tb --co 1
$R dzwiek tb
$R render tb --workers 2
$R kontrola tb
echo "TEST PRZESZEDŁ"
