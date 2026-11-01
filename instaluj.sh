#!/usr/bin/env bash
# Instalacja Montażysty: bez Homebrew, bez git, bez hasła do komputera i bez kont. Wystarczy internet.
# Wszystko ląduje w ~/.montazysta, agenci i skille w ~/.claude, praca w ~/Montaz. Można uruchomić ponownie: to też aktualizacja.
set -euo pipefail

REPO="prywatniejakub/montazysta"
GALAZ="${MONTAZYSTA_GALAZ:-main}"
DOM="${MONTAZYSTA_DOM:-$HOME/.montazysta}"
PRACA="${MONTAZYSTA_PRACA:-$HOME/Montaz}"
KONFIG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
WT="$DOM/wtyczka"
mkdir -p "$DOM/bin"

echo "1/6 Pobieram Montażystę"
TMP="$(mktemp -d)"
if [ -n "${MONTAZYSTA_ZRODLO:-}" ]; then  # test: własna kopia zamiast pobierania
  cp -R "$MONTAZYSTA_ZRODLO" "$TMP/montazysta"
else
  curl -fsSL "https://github.com/$REPO/archive/refs/heads/$GALAZ.tar.gz" | tar -xz -C "$TMP"
  mv "$TMP"/*/plugins/montazysta "$TMP/montazysta"
fi
rm -rf "$WT"
mv "$TMP/montazysta" "$WT"
rm -rf "$TMP"

echo "2/6 Pobieram Pythona i ffmpeg (bez hasła, tylko do tego folderu)"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64)  P=osx-arm64 ;;
  Darwin-x86_64) P=osx-64 ;;
  Linux-x86_64)  P=linux-64 ;;
  *) echo "BŁĄD: nieobsługiwany komputer $(uname -s) $(uname -m)"; exit 1 ;;
esac
MM="$DOM/bin/micromamba"
if [ ! -x "$MM" ]; then
  curl -fsSL -o "$MM" "https://github.com/mamba-org/micromamba-releases/releases/latest/download/micromamba-$P"
  chmod +x "$MM"
fi
export MAMBA_ROOT_PREFIX="$DOM/mamba"
if [ ! -x "$DOM/env/bin/ffmpeg" ] || [ ! -x "$DOM/env/bin/python" ]; then
  rm -rf "$DOM/env"
  "$MM" create -y -q -p "$DOM/env" -c conda-forge --override-channels "python=3.12" "ffmpeg=*=gpl*"
fi
PY="$DOM/env/bin/python"

echo "3/6 Instaluję silnik"
"$PY" -m pip install --quiet --upgrade pip
"$PY" -m pip install --quiet -r "$WT/silnik/wymagania.txt"

echo "4/6 Sprawdzam przeglądarkę"
if ! MONTAZYSTA_DOM="$DOM" "$PY" -c "import sys; sys.path.insert(0, '$WT/silnik'); import narzedzia as N; N.przegladarka()" >/dev/null 2>&1; then
  echo "Brak Chrome: pobieram Chromium tylko dla silnika"
  "$PY" -m pip install --quiet playwright
  PLAYWRIGHT_BROWSERS_PATH="$DOM/chromium" "$PY" -m playwright install chromium
fi

echo "5/6 Pobieram model transkrypcji"
MONTAZYSTA_DOM="$DOM" "$PY" - "$WT/silnik" "${MONTAZYSTA_MODEL:-small}" <<'EOF'
import sys
sys.path.insert(0, sys.argv[1])
import transkrypcja
transkrypcja.model_whisper(sys.argv[2])
EOF

echo "6/6 Dodaję agenta do Claude Code"
kopiuj() {  # ścieżki wtyczki na prawdziwe, nazwy agentów bez przedrostka
  sed -e "s|\${CLAUDE_PLUGIN_ROOT}|$WT|g" -e "s|montazysta:scenarzysta|scenarzysta|g" -e "s|montazysta:recenzent|recenzent|g" -e "s|montazysta:start|montazysta-start|g" "$1" > "$2"
}
mkdir -p "$KONFIG/agents" "$KONFIG/skills/zmontuj" "$KONFIG/skills/montazysta-start"
kopiuj "$WT/skills/zmontuj/SKILL.md" "$KONFIG/skills/zmontuj/SKILL.md"
kopiuj "$WT/skills/start/SKILL.md" "$KONFIG/skills/montazysta-start/SKILL.md"
for a in montazysta scenarzysta recenzent; do
  kopiuj "$WT/agents/$a.md" "$KONFIG/agents/$a.md"
done
mkdir -p "$PRACA/materialy" "$PRACA/rolki" "$PRACA/muzyka"
if [ ! -f "$PRACA/moje-zasady.md" ]; then
  cat > "$PRACA/moje-zasady.md" <<'EOF'
# Moje zasady montażu

Tu trafia każda ocena: zasada + powód + data. Te zasady wygrywają z domyślnymi. Montażysta czyta ten plik przed każdą rolką.

EOF
fi

MONTAZYSTA_DOM="$DOM" MONTAZYSTA_PRACA="$PRACA" bash "$WT/silnik/rolka" sprawdz
