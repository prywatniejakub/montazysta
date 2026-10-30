# Silnik: rolka.json i polecenia

Projekt to folder `~/Montaz/rolki/<nazwa>/`. Silnik składa film klatka po klatce (strona HTML, Chrome bez okna, FFmpeg), więc każdą rzecz na ekranie kontrolujesz co do klatki. Wszystkie czasy w sekundach.

## Tryb A: nagranie z głosem
Po `transkrypcja` masz `transkrypcja/<klucz>.txt` z ponumerowanymi fragmentami: `#12 [45.20-47.90] tekst`.

```json
{
  "styl": "dynamiczny",
  "akcent": "#ffd23f",
  "hak": "NAPIS NA GÓRZE<br>OD KLATKI 0",
  "hak_do": 2.0,
  "wyroznij": "^(klient|zysk|system)",
  "muzyka": "dynamiczny",
  "slownik": "Nazwy własne dla transkrypcji",
  "poprawki": {"zainplementowany": "zaimplementowany"},
  "zrodla": {
    "a": {"plik": "materialy/nagranie.mov", "cx": 0.5, "cy": 0.42},
    "b": {"plik": "materialy/broll.mov", "bez_glosu": true}
  },
  "ujecia": [
    {"zrodlo": "a", "frag": 12},
    {"zrodlo": "a", "frag": [3, 4], "zoom": 1.3},
    {"zrodlo": "a", "frag": 7, "wstawka": {"zrodlo": "b", "od": 2.5, "zoom": 1.1}},
    {"zrodlo": "a", "od": 60.1, "do": 62.4}
  ]
}
```
- `hak` jest opcjonalny: 1-2 krótkie linijki na górze od klatki 0 (jedyny tekst, który może mieć dwie linijki). Streszcza sedno, nie powtarza pierwszego zdania słowo w słowo: wtedy dubluje napisy, więc skróć go albo usuń. `hak_do` = do której sekundy stoi.
- `ujecia` idą po kolei i tworzą film. Możesz je dowolnie przestawiać: najmocniejsze zdanie na początek.
- `frag` = numer albo lista kolejnych numerów, cięcie na granicy słów z małym marginesem.
- `od`/`do` = dokładnie te sekundy, gdy trzeba ciąć w środku fragmentu. Czas każdego słowa: `rolka slowa <projekt> <klucz> --od 10 --do 20`. Napis dostaje każde słowo, którego środek leży w cięciu.
- `poprawki` działają na całych słowach, wielkość liter nie ma znaczenia.
- `napisy_top`: wysokość pasa napisów w px (domyślnie 1190, spokojny 1500). Zmień, gdy napis zasłania twarz.
- Ujęcie dłuższe niż `maks_ujecie` (domyślnie 2,2 s) dzieli się samo na słowach, a obraz przeskakuje plan szeroki / zbliżenie (`zoom_blisko`, domyślnie 1,22). `bez_podzialu: true` wyłącza to dla jednego ujęcia.
- `wstawka` podmienia obraz na czas tego ujęcia, głos leci dalej.
- `cx`, `cy` = środek kadru (0-1) na twarzy; ustal z klatek po `info`. `zoom` na źródle = kadr bazowy.
- Materiał poziomy: silnik wycina kadr 9:16. Przy kadrze węższym niż 1080 px wypisze ostrzeżenie: nie dawaj wtedy mocnego zoomu.

## Tryb B: lektor
Zamiast `ujecia` dajesz `lektor`, potem polecenie `lektor` i `buduj`.
```json
"lektor": {"glos": "zofia", "tempo": "+4%", "przerwa": 0.28, "linie": [
  {"klucz": "g1", "tekst": "Zdanie lektora.", "ujecia": [{"zrodlo": "a", "od": 3.0, "zoom": 1.1}, {"zrodlo": "b", "od": 0, "predkosc": 0.5}]}
]}
```
Głosy darmowe: `zofia`, `marek`. Liczby pisz słownie. Ujęcia dzielą czas linii po równo. `predkosc` < 1 to slow motion (z materiału 60 kl./s).

## Dodatki wspólne
- `liczniki`: `[{"kotwica": "czterysta", "z": 0, "na": 400, "sufiks": "ZŁ", "etykieta": "NA TELEFON"}]`. `kotwica` = słowo z głosu; można też podać `od`, `do`, `koniec`. Tło się rozmywa, napisy znikają na czas licznika.
- `koniec`: plansza końcowa `{"sekundy": 2.5, "nad": "...", "tytul": "...", "pod": "...", "przycisk": "...", "kolor": "#c8102e"}`. Opcjonalnie `"tlo": {"zrodlo": "a", "od": 3}`.
- `znaczek_ai: true`: kółko AI na całej rolce.
- `sfx`: dodatkowe efekty `[["IMP_SOFT", 3.2, -16]]`. Nazwy: `WH_SOFT`, `WH_SWING`, `IMP_SOFT`, `IMP_BASS`, `POP`.
- `muzyka`: `dynamiczny`, `spokojny`, `house`, `mroczny`, plik z `~/Montaz/muzyka` albo `null`. `muzyka_db`: głośność pod głosem (domyślnie -21, spokojny -24).
- `zapas`: sekundy po ostatnim słowie (domyślnie 0,35).

## Własne sceny: dodatki.js
Każda rolka ma być inna. Plik `dodatki.js` w folderze projektu dokłada warstwy nad filmem:
```js
window.DODATKI = [(c, cfg) => {
  const e = el(c, "", "TEKST", { position: "absolute", left: "80px", top: "700px", font: "900 120px Montserrat", color: "#fff" });
  const t0 = W("klient");           // czas słowa z głosu
  sfx("POP", t0, -14);
  return t => pop(e, t, t0);        // wywoływane co klatkę
}];
```
Dostępne: `el, W, sfx, pop, rise, clamp, mix, E, P, spring, shake, premHook, premOdo, premOdoRun, premDraw, premTri, useClip, frameAt, cutLook`. Wszystko liczysz z czasu `t`, nigdy z zegara ani `Math.random()`: render musi być powtarzalny. Po dopisaniu dodatków uruchom `buduj` jeszcze raz.

## Dane wyjściowe
- `stills/` klatki co 0,5 s, `chk/sheet.jpg` arkusz. Pojedyncze PNG oglądasz narzędziem Read.
- `rolka.html` otwarta w przeglądarce to podgląd na żywo (klik = dźwięk, po poleceniu `dzwiek`).
- `<nazwa>.mp4` gotowy film.

## Typowe błędy
- Render jest wolny na długich filmach: 15 s rolki to ok. 1-2 min. Długie polecenia uruchamiaj w tle.
- Puste klatki albo czarne ujęcie: `od` poza długością źródła, sprawdź `info`.
- Obraz z iPhone'a jest wyblakły: silnik sam mapuje HDR, przy starym ffmpeg bez `zscale` robi to przybliżeniem.
