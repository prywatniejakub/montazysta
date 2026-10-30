# Montażysta

Agent do Claude Code. Dajesz mu materiał, piszesz „zmontuj”, a on oddaje gotową rolkę 9:16: wybrane najlepsze fragmenty, napisy po 1-3 słowa zsynchronizowane z głosem, cięcia co 1-2 s, muzyka, efekty, kontrola jakości. Pod spodem pracuje scenarzysta i recenzent.

## Co trzeba mieć
- Mac (Apple Silicon albo Intel) z Claude Code i płatnym planem Claude.
- Dostęp do tego repozytorium na GitHubie.

## Instalacja
1. Przyjmij zaproszenie do repozytorium (mail od GitHuba).
2. W Terminalu zaloguj się do GitHuba:
   ```bash
   brew install gh
   gh auth login
   gh auth setup-git
   ```
3. W Claude Code wklej:
   > Zainstaluj mi wtyczkę montażysty. Uruchom w terminalu: `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1 claude plugin marketplace add prywatniejakub/montazysta` i `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1 claude plugin install montazysta@montazysta-rolki`. Potem poproś mnie o restart Claude Code.
4. Po restarcie napisz: `/montazysta:start`. Pierwsza instalacja pobiera ffmpeg, Pythona i model transkrypcji (ok. 1 GB, 5-15 minut).

## Użycie
Przeciągnij plik do okna albo podaj ścieżkę i napisz na przykład:
- „Zmontuj to nagranie na rolkę dla właścicieli firm, 15 sekund.”
- „Zrób 3 rolki z tego podcastu: <ścieżka albo link>.”
- „Dodaj napisy i potnij, styl spokojny.”

Pliki lądują w `~/Montaz/rolki/<nazwa>/`, gotowy film to `<nazwa>.mp4`. Każda Twoja uwaga zapisuje się w `~/Montaz/moje-zasady.md`, więc agent uczy się Twojego gustu.

## Aktualizacja
```bash
claude plugin marketplace update montazysta-rolki
```
```bash
claude plugin update montazysta@montazysta-rolki
```

## Co jest w środku
- `plugins/montazysta/agents`: montażysta, scenarzysta, recenzent.
- `plugins/montazysta/skills`: `zmontuj` (cały proces), `start` (instalacja).
- `plugins/montazysta/wiedza`: zasady montażu, struktury, hooki, dane o trzymaniu widza.
- `plugins/montazysta/silnik`: render klatka po klatce (HTML, Chrome, FFmpeg), transkrypcja, darmowy lektor, miks dźwięku, kontrole.

Czcionka Montserrat: SIL Open Font License. Efekty dźwiękowe wygenerowane kodem (`scripts/generuj_sfx.py`). Muzyka wygenerowana w ElevenLabs.
