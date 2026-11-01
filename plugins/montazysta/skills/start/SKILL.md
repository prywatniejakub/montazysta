---
name: start
description: Instalacja, naprawa i aktualizacja Montażysty na tym komputerze. Użyj przy „zainstaluj montażystę”, „zaktualizuj montażystę”, „nie działa montaż”, albo gdy silnik zgłasza brak narzędzi.
---

# Instalacja i aktualizacja Montażysty

Użytkownik nie korzysta z terminala: wszystko robisz sam, nie każesz mu niczego wpisywać.

1. Pobierz skrypt:
   ```bash
   curl -fsSL -o /tmp/instaluj-montazyste.sh https://raw.githubusercontent.com/prywatniejakub/montazysta/main/instaluj.sh
   ```
2. Uruchom go w tle, bo przy pierwszym razie pobiera ok. 1,5 GB i trwa 5-15 minut:
   ```bash
   bash /tmp/instaluj-montazyste.sh
   ```
3. Wynik `GOTOWE` oznacza koniec. Po pierwszej instalacji powiedz: „Gotowe. Otwórz nowy czat, wrzuć nagranie i napisz: zmontuj”.
4. Przy błędzie przeczytaj ostatnie linie, napraw przyczynę i uruchom ponownie. Skrypt robi tylko to, czego brakuje.
