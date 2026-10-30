---
name: start
description: Instalacja i sprawdzenie silnika montażysty na tym komputerze (ffmpeg, Python, Chrome, model transkrypcji, folder ~/Montaz). Użyj przy pierwszym uruchomieniu, po „zainstaluj montażystę”, „nie działa montaż”, albo gdy silnik zgłasza brak narzędzi.
---

# Instalacja montażysty

Uruchom w tle, bo pierwsze pobranie trwa kilka minut:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/instaluj.sh"
```

Co dalej:
- Kod wyjścia 10 oznacza brak Homebrew. Homebrew wymaga hasła do Maca, więc poproś użytkownika, żeby wpisał w Claude Code linię zaczynającą się od `!`, którą wypisał skrypt. Potem uruchom instalację ponownie.
- Wynik `GOTOWE` oznacza koniec. Powiedz: „Gotowe. Wrzuć plik albo podaj ścieżkę do nagrania i napisz: zmontuj”.
- Inny błąd: pokaż użytkownikowi ostatnie linie i napraw przyczynę. Nie instaluj niczego spoza listy w `scripts/instaluj.sh` bez pytania.
