# Montażysta

Agent do Claude Code. Dajesz mu materiał, piszesz „zmontuj”, a on oddaje gotową rolkę 9:16: wybrane najlepsze fragmenty, napisy po 1-3 słowa zsynchronizowane z głosem, cięcia co 1-2 s, muzyka, efekty, kontrola jakości. Pod spodem pracuje scenarzysta i recenzent.

## Instalacja
Otwórz Claude Code (aplikacja Claude, zakładka Code) i wklej:

> Zainstaluj mi Montażystę, agenta do montowania rolek. Zrób wszystko sam, ja nie korzystam z terminala. Pobierz skrypt poleceniem `curl -fsSL -o /tmp/instaluj-montazyste.sh https://raw.githubusercontent.com/prywatniejakub/montazysta/main/instaluj.sh`, przeczytaj go i uruchom w tle poleceniem `bash /tmp/instaluj-montazyste.sh`. Trwa 5-15 minut, pobiera ok. 1,5 GB, nie wymaga hasła ani logowania. Gdy na końcu zobaczysz GOTOWE, powiedz mi, żebym otworzył nowy czat, wrzucił nagranie i napisał „zmontuj”.

Nic więcej nie trzeba: bez hasła, kont i Homebrew. Działa na Macu (Apple Silicon i Intel), potrzebny jest Claude Code na płatnym planie.

## Użycie
Przeciągnij plik do okna i napisz na przykład:
- „Zmontuj to nagranie na rolkę dla właścicieli firm, 15 sekund.”
- „Zrób 3 rolki z tego podcastu.”
- „Dodaj napisy i potnij, styl spokojny.”

Pliki lądują w `~/Montaz/rolki/<nazwa>/`, gotowy film to `<nazwa>.mp4`. Każda Twoja uwaga zapisuje się w `~/Montaz/moje-zasady.md`, więc agent uczy się Twojego gustu.

Aktualizacja: napisz w Claude Code „zaktualizuj montażystę”.

## Co jest w środku
- `plugins/montazysta/agents`: montażysta, scenarzysta, recenzent.
- `plugins/montazysta/skills`: `zmontuj` (cały proces), `start` (instalacja i aktualizacja).
- `plugins/montazysta/wiedza`: zasady montażu, struktury, hooki, dane o trzymaniu widza.
- `plugins/montazysta/silnik`: render klatka po klatce (HTML, Chrome, FFmpeg), transkrypcja, darmowy lektor, miks dźwięku, kontrole.

Czcionka Montserrat: SIL Open Font License. Efekty dźwiękowe wygenerowane kodem (`scripts/generuj_sfx.py`). Muzyka wygenerowana w ElevenLabs.
