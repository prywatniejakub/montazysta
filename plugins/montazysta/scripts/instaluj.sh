#!/usr/bin/env bash
# Instaluje silnik montażysty na Macu: ffmpeg i Python przez Homebrew, własne środowisko w ~/.montazysta, folder pracy ~/Montaz.
# Bezpieczne do powtórzenia: robi tylko to, czego brakuje.
set -euo pipefail

TU="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOM="${MONTAZYSTA_DOM:-$HOME/.montazysta}"
PRACA="${MONTAZYSTA_PRACA:-$HOME/Montaz}"
mkdir -p "$DOM"

BREW=""
for k in "$(command -v brew || true)" /opt/homebrew/bin/brew /usr/local/bin/brew; do
  if [ -n "$k" ] && [ -x "$k" ]; then BREW="$k"; break; fi
done

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v python3.12 >/dev/null 2>&1; then
  if [ -z "$BREW" ]; then
    echo "BRAK HOMEBREW. Wpisz w Claude Code tę jedną linię (poprosi o hasło do Maca), potem uruchom instalację ponownie:"
    echo '! /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    exit 10
  fi
  eval "$("$BREW" shellenv)"
  command -v ffmpeg >/dev/null 2>&1 || "$BREW" install ffmpeg
  command -v python3.12 >/dev/null 2>&1 || "$BREW" install python@3.12
fi

PY="$(command -v python3.12)"
if [ ! -x "$DOM/venv/bin/python" ]; then
  "$PY" -m venv "$DOM/venv"
fi
"$DOM/venv/bin/python" -m pip install --quiet --upgrade pip
"$DOM/venv/bin/python" -m pip install --quiet -r "$TU/silnik/wymagania.txt"

# Przeglądarka: wystarczy Chrome z systemu; bez niego pobieramy Chromium tylko dla silnika.
if ! MONTAZYSTA_DOM="$DOM" "$DOM/venv/bin/python" -c "import sys; sys.path.insert(0, '$TU/silnik'); import narzedzia as N; N.przegladarka()" >/dev/null 2>&1; then
  "$DOM/venv/bin/python" -m pip install --quiet playwright
  PLAYWRIGHT_BROWSERS_PATH="$DOM/chromium" "$DOM/venv/bin/python" -m playwright install chromium
fi

mkdir -p "$PRACA/materialy" "$PRACA/rolki" "$PRACA/muzyka"
if [ ! -f "$PRACA/moje-zasady.md" ]; then
  cat > "$PRACA/moje-zasady.md" <<'EOF'
# Moje zasady montażu

Tu trafia każda ocena: zasada + powód + data. Te zasady wygrywają z domyślnymi. Montażysta czyta ten plik przed każdą rolką.

EOF
fi

# Model transkrypcji pobieramy raz, żeby pierwsze zlecenie nie czekało (ok. 0,5 GB).
MONTAZYSTA_DOM="$DOM" "$DOM/venv/bin/python" - "$TU/silnik" "${MONTAZYSTA_MODEL:-small}" <<'EOF'
import sys
sys.path.insert(0, sys.argv[1])
import transkrypcja
transkrypcja.model_whisper(sys.argv[2])
EOF

bash "$TU/silnik/rolka" sprawdz
