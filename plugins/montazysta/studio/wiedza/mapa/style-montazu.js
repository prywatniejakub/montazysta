// Zakładka „Style montażu” w Mapie do celu + KATALOG dla Claude'a. Edytować ręcznie (poprawny JSON po znaku „=”).
// Użytkownik mówi „zrób rolki dla X w stylu NN” -> Claude bierze stąd przepis, silnik, wzór i notatki, zanim zrobi pierwszą klatkę.
// Próbki do podglądu (lżejsze kopie) robi: runtime\python.exe tools\mapa\style_probki.py  (wynik: tools\mapa\style-montazu\NN.mp4/.jpg)
// Numery są STAŁE: nowy styl (np. z researchu profili) dostaje kolejny wolny numer na końcu, stary nigdy nie zmienia numeru.
window.STYLE_MONTAZU = {
 "aktualizacja": "2026-11-02",
 "statusy": {
  "wzor": "Wzorzec",
  "dziala": "Zaakceptowany",
  "test": "Do oceny",
  "stop": "Nie używać"
 },
 "grupy": [
  {"id": "klient", "nazwa": "Z nagrań klienta", "opis": "Klient przysyła swoje filmy i zdjęcia, my montujemy."},
  {"id": "ai", "nazwa": "Z postacią AI", "opis": "Klient nie ma nagrań: twarzą marki jest nasza postać AI."},
  {"id": "kino", "nazwa": "Kino AI", "opis": "Filmowe, niemożliwe ujęcia AI: cały spot albo wstęp do rolki."},
  {"id": "motion", "nazwa": "Motion design premium", "opis": "Montaż napisany kodem: makiety, karty, kamera 3D. Poziom After Effects."},
  {"id": "broll", "nazwa": "B-roll ze stocku", "opis": "Ujęcia ze stocku, grafiki i lektor, bez twarzy."},
  {"id": "format", "nazwa": "Formaty z humorem", "opis": "Parodie i formaty z TikToka na materiale klienta."},
  {"id": "stop", "nazwa": "Nie używać", "opis": "Style, z których zrezygnowaliśmy, z powodem. Żeby nikt do nich nie wrócił przez przypadek."}
 ],
 "style": [
  {
   "nr": 1, "grupa": "klient", "nazwa": "Karty ze szkła", "status": "wzor", "status_t": "Wzorzec dla klinik",
   "ocena": "„Najładniejszy, zajebisty”", "ocena_data": "2026-11-02",
   "co": "Spokojny, drogi montaż nagrań eksperta: hak, napisy i podpis w matowych szklanych kartach.",
   "kiedy": "Kliniki, lekarze, usługi premium, gdzie ekspert mówi do kamery.",
   "przepis": [
    "Hak w szklanej karcie u góry, widoczny od klatki 0, litery z zapasem na ogonki (g, y).",
    "Napisy 1-3 słowa w szklanej pigułce na wysokości klatki piersiowej, przy zbliżeniu pod brodą.",
    "Podpis eksperta jako pływająca karta z inicjałami (ruch ok. 4 px), bez białego prostokąta.",
    "Liczba (np. czas zabiegu) w karcie z pierścieniem, bez przyciemniania obrazu.",
    "Plansza: szklana karta na rozmytym zdjęciu budynku, miętowy przycisk.",
    "Plus Jakarta Sans, ciemny morski + miętowy akcent, powolny najazd 1,00-1,045, efekty cicho (-27 do -33 dB), zero huku."
   ],
   "silnik": "motion/c4y/kolmed-styl/szablon-styl.html (STYLE \"D\") + dstyl.py",
   "wzor": "motion/c4y/kzd1",
   "koszt": "0 zł montażu (głos z nagrania klienta)",
   "notatki": ["wiedza/feedback-styl-d-karty-szklo-kliniki.md", "wiedza/projekty/styl-rolek-klinika-2026-11-01.md"],
   "probka": {"plik": "motion/c4y/kzd1/kzd1.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/kzd2/kzd2.mp4", "motion/c4y/kzd3/kzd3.mp4", "motion/c4y/kzd8/kzd8.mp4"]
  },
  {
   "nr": 2, "grupa": "klient", "nazwa": "Klinika czysto", "status": "test", "status_t": "Wariant, przegrał z 01",
   "ocena": "Pokazany 2026-11-01 obok 01, nie wybrany do Kolmedu", "ocena_data": "2026-11-01",
   "co": "Styl instytucji (Cleveland, Mayo): małe zdaniowe napisy, granat, podpis rysowany linią.",
   "kiedy": "Szpitale, duże przychodnie, poważne instytucje, gdy ma być bardzo oficjalnie.",
   "przepis": [
    "Manrope, napisy zdaniowe ok. 58 px nisko, granatowa pigułka na słowie kluczowym.",
    "Podpis: linia rośnie, imię i rola wjeżdżają z maski.",
    "Liczba cienką cyfrą, bez przyciemnienia.",
    "Przenikanie 0,24 s zamiast twardych cięć.",
    "Plansza: granatowy gradient, białe logo, przycisk z obrysem."
   ],
   "silnik": "motion/c4y/kolmed-styl/szablon-styl.html (STYLE \"A\") + styl.py",
   "wzor": "motion/c4y/kzsa",
   "koszt": "0 zł montażu",
   "notatki": ["wiedza/projekty/styl-rolek-klinika-2026-11-01.md"],
   "probka": {"plik": "motion/c4y/kzsa/kzsa.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 3, "grupa": "klient", "nazwa": "Edytorski", "status": "test", "status_t": "Wariant, przegrał z 01",
   "ocena": "Pokazany 2026-11-01 obok 01, nie wybrany do Kolmedu", "ocena_data": "2026-11-01",
   "co": "Cichy luksus jak Lanserhof: szeryfowa kursywa, ciepły kolor, ziarno, smuga światła.",
   "kiedy": "Beauty premium, medycyna estetyczna, spa, nieruchomości i marki luksusowe.",
   "przepis": [
    "Instrument Serif kursywą (hak, słowa kluczowe, nazwisko) + DM Sans do reszty.",
    "Ciepły grading, ziarno ok. 3%, smuga światła przy cięciu.",
    "Przejście przez ciemność z rozmyciem.",
    "Liczba szeryfem („ok. 7 minut”).",
    "Plansza ciemna z rozmytym zdjęciem z wejścia."
   ],
   "silnik": "motion/c4y/kolmed-styl/szablon-styl.html (STYLE \"B\") + styl.py",
   "wzor": "motion/c4y/kzsb",
   "koszt": "0 zł montażu",
   "notatki": ["wiedza/projekty/styl-rolek-klinika-2026-11-01.md"],
   "probka": {"plik": "motion/c4y/kzsb/kzsb.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 4, "grupa": "klient", "nazwa": "Dokument", "status": "test", "status_t": "Wariant, przegrał z 01",
   "ocena": "Pokazany 2026-11-01 obok 01, nie wybrany do Kolmedu", "ocena_data": "2026-11-01",
   "co": "Reportaż: wersaliki, napisy jak w filmie, chłodny kolor z tealem, licznik jak zegar.",
   "kiedy": "Firmy techniczne, produkcja, budownictwo premium, wszystko „zza kulis”.",
   "przepis": [
    "Archivo wersalikami (hak, nazwisko pisane literami), napisy filmowe Inter nisko.",
    "Chłodny grading z tealem, ziarno.",
    "Poziome przesunięcie z rozmyciem ruchu przy cięciu.",
    "Liczba jako licznik zegara (07:00).",
    "Plansza czarna ze zdjęciem budynku."
   ],
   "silnik": "motion/c4y/kolmed-styl/szablon-styl.html (STYLE \"C\") + styl.py",
   "wzor": "motion/c4y/kzsc",
   "koszt": "0 zł montażu",
   "notatki": ["wiedza/projekty/styl-rolek-klinika-2026-11-01.md"],
   "probka": {"plik": "motion/c4y/kzsc/kzsc.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 5, "grupa": "klient", "nazwa": "Napisy wyskakujące", "status": "dziala", "status_t": "Tak dla firm usługowych, nie dla klinik",
   "ocena": "Shift: „ok, wrzucaj” (2026-10-05). Klinika: „tandetny, widać, że montował Claude” (2026-11-01)", "ocena_data": "2026-11-01",
   "co": "Dynamiczny montaż z dużymi napisami Segoe Black, które wskakują z głosem.",
   "kiedy": "Firmy usługowe i produktowe z dynamicznym materiałem (warsztat, praca, schrony). Nie do medycyny i marek premium (tam 01).",
   "przepis": [
    "Napisy max 3 słowa / 16 znaków, Segoe UI Black wersalikami, biały z czarnym obrysem, kolor marki na słowie kluczowym, zawsze jedna linijka.",
    "Hak u góry widoczny od t=0, pełny kadr 9:16 (nigdy karta 16:9 w ramce).",
    "Najazd przy cięciu + rozmycie wejścia, cięcie co 1-2 s.",
    "Liczby jako licznik kasynowy: tło rozmyte, napisy wtedy wyłączone.",
    "Wypalone napisy klienta: kadr z zoomem od góry, żeby wypadły za dolną krawędź.",
    "Zero banerów „Próbka” i pasków na obrazie."
   ],
   "silnik": "motion/c4y/lib/prem.js + prem.css (premCaps, premDraw, premOdo, premTri)",
   "wzor": "motion/c4y/shf1 (napisy w jednej linii: motion/c4y/scp2)",
   "koszt": "0 zł montażu + lektor ElevenLabs ok. 0,1-0,2 $",
   "notatki": ["wiedza/feedback-c4y-probki-montaz.md"],
   "probka": {"plik": "motion/c4y/shf1/shf1.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/shf3/shf3.mp4", "motion/c4y/sch2/sch2.mp4", "motion/c4y/sch3/sch3.mp4", "motion/c4y/kz2/kz2.mp4"]
  },
  {
   "nr": 6, "grupa": "klient", "nazwa": "Ich film skrócony, ich głos", "status": "dziala", "status_t": "Zaakceptowany",
   "ocena": "Shift: 3 rolki „ok, wrzucaj”; najlepszy pokaz usługi „montaż z Waszych nagrań”", "ocena_data": "2026-10-05",
   "co": "Długie nagranie, w którym klient sam mówi, tniemy po słowach do 30 s i dokładamy nasze napisy.",
   "kiedy": "Właściciel albo pracownik sam nagrywa się telefonem. Najtańsza i najbardziej wiarygodna forma.",
   "przepis": [
    "Transkrypcja nagrania (ElevenLabs scribe), wybór najmocniejszych zdań w kolejności: hak, konkret, liczba, wezwanie.",
    "Cięcie dźwięku po słowach, oś czasu z transkrypcji.",
    "Napisy 1-3 słowa jak w stylu 05, kolor marki klienta.",
    "Kadr z zoomem od góry, żeby ich wypalone napisy wypadły za kadr.",
    "Kontrola: transkrypcja gotowego MP4, czy żadne słowo nie jest ucięte."
   ],
   "silnik": "motion/c4y/lib/prem.js + motion/c4y/leady/transkrypcja.py + longkit.audio",
   "wzor": "motion/c4y/shf2",
   "koszt": "ok. 0 zł (transkrypcja grosze)",
   "notatki": ["wiedza/feedback-c4y-probki-montaz.md", "wiedza/feedback-lektor-ciecia-i-wymowa.md"],
   "probka": {"plik": "motion/c4y/shf2/shf2.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 7, "grupa": "klient", "nazwa": "Ciepły, empatyczny", "status": "dziala", "status_t": "Klient kupił po tej rolce",
   "ocena": "Rolka próbna dla Żółtego Szalika, Emil kupił i przedłużył (20 rolek/mies.)", "ocena_data": "2026-10-19",
   "co": "Zdjęcia miejsca klienta z wolnym ruchem kamery, spokojna lektorka, ciepłe światło, zero twarzy pacjentów.",
   "kiedy": "Tematy wrażliwe: uzależnienia, zdrowie psychiczne, opieka, terapia, rodzina.",
   "przepis": [
    "Hak = sytuacja z życia rodziny, np. powiadomienie „Tata 23:47: To był ostatni raz”, etykieta „PYTANIE OD RODZINY”.",
    "Zdjęcia ośrodka i ogrodu z powolnym ruchem kamery i ciepłą poświatą, sylwetki zamiast twarzy.",
    "Napisy 1-3 słowa z żółtym słowem marki.",
    "Licznik doświadczenia (15 LAT) na zdjęciu.",
    "Kremowa plansza: logo, numer, żółty przycisk „Zadzwoń”.",
    "Lektorka spokojna (Magdalena), muzyka cicha (g4d_calm); wersja TikTok bez numeru w kadrze i głosie."
   ],
   "silnik": "motion/c4y/zoltyszalik (script.py), wersje TikTok: motion/c4y/zsz/tiktok.py",
   "wzor": "motion/c4y/zoltyszalik i motion/c4y/zs3",
   "koszt": "0 zł montażu + lektor ElevenLabs ok. 0,15 $",
   "notatki": ["wiedza/project-c4y-emil-zoltyszalik.md"],
   "probka": {"plik": "motion/c4y/zoltyszalik/zoltyszalik.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/zs2/zs2.mp4", "motion/c4y/zs3/zs3.mp4", "motion/c4y/zs5/zs5.mp4"]
  },
  {
   "nr": 8, "grupa": "klient", "nazwa": "Poradnik fachowca", "status": "dziala", "status_t": "Zaakceptowany",
   "ocena": "Rolki Izzi Therm #35-#40 zaakceptowane", "ocena_data": "2026-10-27",
   "co": "Edukacja inwestora: pytanie, schemat narysowany kodem, liczba ze źródłem, zdjęcia z budowy klienta.",
   "kiedy": "Budownictwo, instalacje, wykonawcy: firma, która ma wiedzę, a nie ma czasu nagrywać.",
   "przepis": [
    "Hak pytaniem do klienta końcowego („Budujesz dom?”) na zdjęciu z budowy.",
    "Schemat (np. warstwy podłogi) rysowany kodem, element pęka, gdy lektor o tym mówi.",
    "Karta z liczbą i źródłem (34,8% odbiorów z pękniętą wylewką).",
    "B-roll z prac klienta pod każdym zdaniem.",
    "Jasna plansza ze zdjęciem eksperta i „Darmowa konsultacja”.",
    "Lektor pewny (Tomasz), 34-38 s, ton „kulturalna, dostojna firma”."
   ],
   "silnik": "motion/c4y/izt (silnik rolek Izzi Therm)",
   "wzor": "motion/c4y/it1",
   "koszt": "0 zł montażu + lektor ElevenLabs ok. 0,3 $",
   "notatki": ["wiedza/project-c4y-izzitherm.md"],
   "probka": {"plik": "motion/c4y/it1/it1.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 9, "grupa": "ai", "nazwa": "Dynamiczny z historią", "status": "wzor", "status_t": "Standard rolek klientów",
   "ocena": "„Dopaminowy, zajebisty, bardzo mi się podoba”; „rób w tym stylu pozostałe”", "ocena_data": "2026-10-06",
   "co": "Krótka historia z postacią AI, cięcie co 1-2 s i prawdziwa strona klienta w telefonie, którą klika palec.",
   "kiedy": "Portale, aplikacje, sklepy, usługi z własną stroną. Domyślny styl, gdy klient nie ma nagrań.",
   "przepis": [
    "Hasło na zbliżeniu twarzy od klatki 0.",
    "Zmiana obrazu co 1-2 s: plan szeroki, zbliżenie (jak 2 kamery), wstawki z historii (ogłoszenia, dzwoniący telefon).",
    "Prawdziwa strona klienta w widoku telefonu (sitecap.py), przewijana, palec klika przycisk.",
    "Przejścia z ruchem, raz z lewej, raz z prawej.",
    "Postać nigdy zamrożona: gdy usta się kończą, cięcie na inny obraz.",
    "Rytmiczna muzyka (g4d_groove, 100 BPM), cięcia pod bit, efekty do akcji. Każda rolka ma inną strukturę."
   ],
   "silnik": "motion/c4y/lib/g4s.js + g4s.css + g4s.py, zrzuty strony: lib/sitecap.py",
   "wzor": "motion/c4y/go4d8 i motion/c4y/go4d9",
   "koszt": "ok. 0,5-1,5 $ (zdjęcia Nano Banana + usta Kling Avatar v2 albo Sync v2 pro tylko na sekundy twarzy)",
   "notatki": ["wiedza/feedback-c4y-rolki-klientow-montaz.md", "wiedza/feedback-usta-zakaz-latentsync.md", "wiedza/feedback-znaczek-ai.md"],
   "probka": {"plik": "motion/c4y/go4d8/go4d8.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/go4d9/go4d9.mp4"]
  },
  {
   "nr": 10, "grupa": "ai", "nazwa": "Spokojny, wyważony", "status": "dziala", "status_t": "Zaakceptowany",
   "ocena": "„Profesjonalny, wyważony”, drugi styl do wyboru dla klienta obok 09", "ocena_data": "2026-10-06",
   "co": "Ta sama historia co 09, ale dłuższe ujęcia, przenikania, spokojna muzyka i mniej bodźców naraz.",
   "kiedy": "Klient, który woli powagę niż dopaminę: finanse, B2B, starsza grupa docelowa.",
   "przepis": [
    "Przenikanie 0,5 s między ujęciami (G4.shots z fade: 1).",
    "Łagodny kadr twarzy, wolny najazd ok. 4 s.",
    "Napisy zwykłymi literami na ciemnej szybie, fragmenty zdań (G4.caps z trybem spokojnym).",
    "Muzyka g4d_calm (pianino + delikatny puls) pod głosem ok. -20 dB, tylko ciche kliknięcia i szumy.",
    "Prawdziwa strona i rejestracja klienta jak w 09."
   ],
   "silnik": "motion/c4y/lib/g4s.js (tryb spokojny) + g4s.py",
   "wzor": "motion/c4y/go4d10 i motion/c4y/go4d11",
   "koszt": "jak 09",
   "notatki": ["wiedza/feedback-c4y-rolki-klientow-montaz.md"],
   "probka": {"plik": "motion/c4y/go4d10/go4d10.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/go4d11/go4d11.mp4"]
  },
  {
   "nr": 11, "grupa": "ai", "nazwa": "Postać AI w hooku, potem produkt", "status": "dziala", "status_t": "Zaakceptowany",
   "ocena": "„Wideo zajebiste”, podmienione na stronie klienta", "ocena_data": "2026-10-06",
   "co": "Pierwsze ok. 3 s mówi elegancka postać AI w miejscu z sociali klienta, potem montaż jego produktów.",
   "kiedy": "Sklepy, producenci, e-commerce: twarz marki bez nagrywania.",
   "przepis": [
    "Jedna postać AI w 3 scenach z sociali klienta (np. showroom, krzesło z oferty), naturalny ruch ust.",
    "Głos dobrany do wieku i stylu postaci (elegancka kobieta = dojrzały, ciepły głos, np. Magdalena).",
    "Po hooku montaż produktów z ich filmów, napisy 1-3 słowa z kolorem marki.",
    "Plansza marki z jednym argumentem („Raty 0%”).",
    "Znaczek AI w prawym górnym rogu na ujęciach z postacią."
   ],
   "silnik": "motion/c4y/dkav/avatar.py + patch_html.py, napisy prem.js",
   "wzor": "motion/c4y/dk1",
   "koszt": "ok. 1,8 $ (zdjęcia + usta)",
   "notatki": ["wiedza/feedback-c4y-probki-montaz.md", "wiedza/feedback-zero-wydatkow-bez-zgody.md"],
   "probka": {"plik": "motion/c4y/dk1/dk1.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/dk2/dk2.mp4", "motion/c4y/dk3/dk3.mp4"]
  },
  {
   "nr": 12, "grupa": "ai", "nazwa": "Postać AI do kamery + białe karty", "status": "wzor", "status_t": "Wzorzec w reklamach: 3 klientów",
   "ocena": "Wszystkie 3 płacące firmy z reklam przyszły z tego stylu (reklamy 03, 12, 15)", "ocena_data": "2026-10-26",
   "co": "Gość AI mówi do kamery z żółtym wołaniem, potem jasne karty, które pokazują ofertę krok po kroku.",
   "kiedy": "Reklamy Meta Clips4you i klientów, gdy trzeba sprzedać usługę z ofertą.",
   "przepis": [
    "Klatka 0: postać AI + żółte „WŁAŚCICIELE FIRM ↓” u góry + głos od 0 s.",
    "Po hooku kremowe tło: karty z czarnym obrysem, żółte akcenty, ikony 3D, telefony z rolkami.",
    "Obietnica w żółtym kole jak pieczęć (gwarancja).",
    "Koniec: „Umów 15 minut rozmowy” + przycisk, który klika kursor.",
    "Usta tylko Sync Lipsync v2 pro albo Kling Avatar v2 na sekundy twarzy, nigdy LatentSync; znaczek AI."
   ],
   "silnik": "motion/c4y/lib/c4yad.js",
   "wzor": "motion/c4y/ad3, ad12, ad15 (odbicia: o03, o12, o15)",
   "koszt": "ok. 0,3-0,4 $ usta + głos",
   "notatki": ["wiedza/reklamy-co-dziala.md", "wiedza/clips4you-3-rolki-oferta-v2.md", "wiedza/feedback-znaczek-ai.md"],
   "probka": {"plik": "motion/c4y/ad12/ad12.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/ad3/ad3.mp4", "motion/c4y/ad15/ad15.mp4", "motion/c4y/o12/o12.mp4"]
  },
  {
   "nr": 13, "grupa": "ai", "nazwa": "Scenki AI z prawdziwego świata", "status": "dziala", "status_t": "Topka wizualnie, w reklamie 0 leadów",
   "ocena": "„Kurwa topka”: zwykłe ludzkie sceny, jakby nagrane telefonem", "ocena_data": "2026-10-11",
   "co": "Nasz gość w żółtym garniturze idzie, kuca, pije kawę w Warszawie; jeden element zdradza AI.",
   "kiedy": "Treści organiczne i rozpoznawalna postać marki. Jako cała reklama Meta: 0 leadów (AI2, AI3).",
   "przepis": [
    "2 sceny, każda z zaplanowanym ruchem postaci (idzie, kuca, siada, pije kawę), jak z kamery z ręki.",
    "Jeden element „nie pasuje” (np. lato zmienia się w zimę w trakcie wiązania buta).",
    "Mowa osobnymi klipami 2-4 s od klatki wideo, twarz duża, proste słowa bez zbitek ą, ę, ż.",
    "Montaż: wycięte przerwy, skoki zbliżeniem, napisy zdaniami z żółtym słowem.",
    "Czarna karta Clips4you na końcu, znaczek AI."
   ],
   "silnik": "motion/c4y/lib/kino.py (Nano Banana 2.1 + H3 Max) + montaz.py w folderze rolki",
   "wzor": "motion/c4y/r10 (montaz2.py) i motion/c4y/r14",
   "koszt": "ok. 3,5-6 zł za rolkę",
   "notatki": ["wiedza/clips4you-rolki-10-i-6.md", "wiedza/project-c4y-film-kinowy-ai.md"],
   "probka": {"plik": "motion/c4y/r10/r10_dyn.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/r14/r14_v6.mp4", "motion/c4y/r6/r6_dyn.mp4"]
  },
  {
   "nr": 14, "grupa": "ai", "nazwa": "Rozmowa AI (podcast)", "status": "test", "status_t": "Czeka na ocenę",
   "ocena": "Wysłana 2026-10-11, bez oceny", "ocena_data": "2026-10-11",
   "co": "Dwie postacie AI w studiu podcastowym: pytanie, odpowiedź, reakcja, puenta. 9-10 s.",
   "kiedy": "Krótkie treści organiczne z puentą o usłudze, wywiad z „klientem”.",
   "przepis": [
    "Każda kwestia = jeden klip 4 s (jedna akcja, twarz blisko), każda w 2 ujęciach na zapas.",
    "W referencjach jednego kadru nigdy 2 różne twarze (filtr fal odrzuca).",
    "Łańcuch głosu „podcast” w ffmpeg, bez muzyki pod rozmową.",
    "Reakcja prowadzącego z końcówki jego klipu (0 zł), napisy zdaniami, czarna karta CTA."
   ],
   "silnik": "motion/c4y/lib/kino.py + motion/c4y/r15/montaz.py",
   "wzor": "motion/c4y/r15",
   "koszt": "ok. 3,5 zł",
   "notatki": ["wiedza/clips4you-r15-podcast.md"],
   "probka": {"plik": "motion/c4y/r15/r15.mp4", "plakat": 0.6},
   "przyklady": []
  },
  {
   "nr": 15, "grupa": "kino", "nazwa": "Kino AI, cały spot", "status": "test", "status_t": "Reklama: 0 leadów",
   "ocena": "Najlepsze zatrzymanie na 3 s, ale prawie nikt nie klika (2 testy, CPM do 177 zł)", "ocena_data": "2026-10-25",
   "co": "Hiperrealistyczne, niemożliwe ujęcia (oko z lusterek, fala nad miastem), lektor z offu, czarna plansza.",
   "kiedy": "Pokaz możliwości, profil marki, treść organiczna. Nie jako cała reklama sprzedażowa.",
   "przepis": [
    "Kadry Nano Banana 2.1, ruch H3 Max (768P na próbę, 1080P na finał).",
    "Mocne kolory marki (żółty), materiały odbijające, jedna postać w kilku scenach.",
    "Lektor zdaniami po 3-6 słów, napisy zdaniami z żółtym słowem kluczowym.",
    "Koniec jak trailer: czarny ekran z logo i przyciskiem."
   ],
   "silnik": "motion/c4y/lib/kino.py",
   "wzor": "motion/c4y/sekunda",
   "koszt": "ok. 16-35 zł za spot",
   "notatki": ["wiedza/project-c4y-film-kinowy-ai.md", "wiedza/clips4you-kino-hooki-bank.md"],
   "probka": {"plik": "motion/c4y/sekunda/sekunda.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/kino2/kino2_test.mp4"]
  },
  {
   "nr": 16, "grupa": "kino", "nazwa": "Filmowy wstęp + reklama", "status": "test", "status_t": "Nietestowany jako wstęp do rolki z twarzą",
   "ocena": "Wersja z wstępem i białymi kartami (AI2 v2) leciała w reklamie: 0 leadów", "ocena_data": "2026-10-25",
   "co": "3-7 s filmowego ujęcia AI doklejone tak, że ostatnia klatka wstępu jest pierwszą klatką reklamy.",
   "kiedy": "Gdy rolka ma dobrą treść, a słaby początek. Skill kino-hook.",
   "przepis": [
    "Wstęp sprzedaje: żółte „WŁAŚCICIELE FIRM ↓” od klatki 0, napis do 5 słów, metafora obietnicy.",
    "Bohater = nasz gość z reklamy, nie obca postać.",
    "Ostatnia klatka wstępu = czysta klatka reklamy (jcut), cięcia nie widać.",
    "Kadry do akceptacji przed płatnym ruchem; wycena przed każdym krokiem."
   ],
   "silnik": "skill kino-hook, motion/c4y/lib/kino.py (wzór script.py: kinotest, kino2)",
   "wzor": "motion/c4y/zat2 i motion/c4y/kinotest",
   "koszt": "ok. 2-6 zł za wstęp",
   "notatki": ["wiedza/kino-hook-podrecznik.md", "wiedza/clips4you-kino-hooki-bank.md"],
   "probka": {"plik": "motion/c4y/zat2/AI2_zatrzymales_v2.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/kinotest/kinotest.mp4"]
  },
  {
   "nr": 17, "grupa": "motion", "nazwa": "SaaS premium (film 16:9)", "status": "wzor", "status_t": "Najwyższa ocena: 100/10",
   "ocena": "„100/10, mogłoby samo sprzedawać”; Lekcja 1: „kurwa genialne, najlepszy, najładniejszy styl dotychczas”", "ocena_data": "2026-09-25",
   "co": "Każde zdanie lektora to osobny obraz w ruchu: makiety aplikacji, kamera 3D, przejścia „coś w coś”.",
   "kiedy": "Filmy na YouTube, film oferty, pokaz produktu lub usługi, strona.",
   "przepis": [
    "Każde zdanie = obraz, który je dosłownie ilustruje (liczba → licznik, „38 klientów” → 38 stron).",
    "Ciągłość „coś w coś”: następna scena powstaje z obiektu poprzedniej (min. co drugie przejście).",
    "2-3 zwroty w kadrze: kamera się oddala i to, co widzieliśmy, jest częścią czegoś większego.",
    "Słowa wchodzą dokładnie z głosem (fade + 30 px + rozmycie), gradient na słowach kluczowych, zero napisów na dole.",
    "Prawdziwe materiały w makietach, kamera 3D zawsze w ruchu, przeplot jasnych i ciemnych scen (granat + zorza, szkło).",
    "Muzyka z budową, efekty cicho i rzadko, muzyka ok. 10 dB pod głosem."
   ],
   "silnik": "motion/kuba/lib/saas.js + saas.css, budowa lib/longkit.py",
   "wzor": "motion/kuba/kits/studio i motion/kuba/l1s",
   "koszt": "0 zł montażu + lektor",
   "notatki": ["wiedza/feedback-saas-film-style.md"],
   "probka": {"plik": "motion/kuba/kits/studio/studio.mp4", "od": 0, "do": 50, "plakat": 3},
   "przyklady": ["motion/kuba/l1s/l1s.mp4", "motion/kuba/l2s/l2s.mp4"]
  },
  {
   "nr": 18, "grupa": "motion", "nazwa": "SaaS rolka z prawdziwą twarzą", "status": "wzor", "status_t": "Wzorzec rolek 9:16",
   "ocena": "„Kozacka… to jest naprawdę to, co chcę uzyskać”; r25v: „naprawdę dobra, genialne”", "ocena_data": "2026-09-26",
   "co": "Styl 17 w pionie: prawdziwa twarz 2-3 razy dla wiarygodności, reszta to makiety w ruchu.",
   "kiedy": "Rolki marki osobistej i własne sociale, gdy jest nagranie twarzy.",
   "przepis": [
    "Klatka 0 = dziwny pełny obraz + tekst-rama + głos od 0,00 s (np. rozmowa z bananem jak z mikrofonem).",
    "Twarz z prawdziwego nagrania, usta podmienione (lipsync) tylko w 2-3 miejscach.",
    "Reszta: telefon z ekranami, pole czatu → kod → odhaczana lista, pinezka „You are here”.",
    "Callback: obraz z początku wraca na końcu.",
    "15-20 s, zmiana obrazu co 1,5-2,5 s, jeden głos w całej rolce."
   ],
   "silnik": "motion/kuba/lib/saas.js + saas-reel.js/.css; podręcznik: .claude/skills-archiwum/zrob-rolke/SKILL.md",
   "wzor": "motion/kuba/r29v i motion/kuba/r25v",
   "koszt": "ok. 0,1 $ lipsync + lektor",
   "notatki": ["wiedza/feedback-reel-retention.md", "wiedza/feedback-saas-film-style.md"],
   "probka": {"plik": "motion/kuba/r29v/r29v.mp4", "plakat": 0.4},
   "przyklady": ["motion/kuba/r25v/r25v.mp4"]
  },
  {
   "nr": 19, "grupa": "motion", "nazwa": "VSL jasny z żółtym", "status": "wzor", "status_t": "LIVE na clips4you.pl/start",
   "ocena": "„Film jest perfekcyjny, wrzuć go na stronę”", "ocena_data": "2026-10-08",
   "co": "Styl 17 na jasnym tle w kolorach Clips4you: twarz w okienku, jedna karta zmienia kształt w plan.",
   "kiedy": "Film oferty na stronę, VSL, film „jak to działa” dla klienta.",
   "przepis": [
    "Okienko z twarzą w zdaniu rozszerza się w kalendarz (ta sama proporcja).",
    "Jedna „skorupa” zmienia kształt: dokument → tematy z branży → ranking → plan z akceptacją.",
    "Oś rolki z flagami, zwrot „tak zrobiona była reklama, dzięki której tu trafiłeś”.",
    "Kamera płaska (bez przecinania elementów w 3D), stary napis znika przed nowym.",
    "Muzyka sklejona z równych taktów, ok. 10 dB pod głosem, bez głośnych kulminacji."
   ],
   "silnik": "motion/c4y/vsl5 (script.py, vsl5.html, u1-u3.js, u.css)",
   "wzor": "motion/c4y/vsl5",
   "koszt": "0 zł montażu + lektor",
   "notatki": ["wiedza/clips4you-film-oferty-scenariusz.md", "wiedza/feedback-saas-film-style.md", "wiedza/feedback-lektor-ciecia-i-wymowa.md"],
   "probka": {"plik": "motion/c4y/vsl5/vsl5.mp4", "od": 0, "do": 50, "plakat": 4},
   "przyklady": []
  },
  {
   "nr": 20, "grupa": "motion", "nazwa": "Makiety ekranów na czarnym", "status": "test", "status_t": "Bez oceny",
   "ocena": "Pierwsza rolka na strukturze „Dlatego powstało”, bez oceny użytkownika", "ocena_data": "2026-10-11",
   "co": "Czarne tło, świecące żółte słowa i makiety telefonu: problem, „dlatego powstało”, kroki, wezwanie.",
   "kiedy": "Wyjaśnienie nowej usługi lub marki bez nagrań i bez postaci.",
   "przepis": [
    "Struktura: pytanie do widza → ból → „Posłuchaj tego” → wizja → „Dlatego powstało X” → 3-4 kroki → „nie musisz…” → wezwanie.",
    "Makiety: zegar telefonu „milczy”, panel z krokami, lista z przekreśleniami.",
    "Żółte słowa ze świeceniem na czarnym, jeden jasny ekran na zwrot.",
    "Koniec: „Kliknij i umów 15 minut rozmowy”."
   ],
   "silnik": "motion/c4y/ui1 (script.py + strona)",
   "wzor": "motion/c4y/ui1",
   "koszt": "0 zł montażu + lektor",
   "notatki": ["wiedza/clips4you-struktury-rolek.md"],
   "probka": {"plik": "motion/c4y/ui1/ui1.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 21, "grupa": "motion", "nazwa": "Showreel 3D", "status": "test", "status_t": "Nieoceniony",
   "ocena": "Zrobiony 2026-09-23 jako pokaz „poziom Adobe”, bez oceny", "ocena_data": "2026-09-23",
   "co": "Premium karty 3D jak w reklamach Apple i Revolut, rozmycie ruchu, 60 kl./s, „Ten film nie powstał w After Effects”.",
   "kiedy": "Pokaz możliwości agencji, intro marki, film na stronę.",
   "przepis": [
    "Karty szklane pochylone w 3D, odsłaniane po kolei w rytm muzyki.",
    "Płynne wygaszanie expo/spring, tło z plamami koloru.",
    "Prawdziwe rozmycie ruchu (3 podklatki na klatkę), 60 kl./s.",
    "Sceny ułożone na siatce taktów muzyki, uderzenie na drop."
   ],
   "silnik": "motion/showreel.html + motion/render.py (--fps 60 --sub 3) + motion/audio.py",
   "wzor": "motion/showreel.html",
   "koszt": "0 zł",
   "notatki": ["wiedza/project-motion-showreel.md"],
   "probka": {"plik": "motion/Showreel premium.mp4", "plakat": 2},
   "przyklady": []
  },
  {
   "nr": 22, "grupa": "broll", "nazwa": "B-roll ze stocku z lektorem", "status": "test", "status_t": "Do poprawy: 2/10",
   "ocena": "„Spoko, ale nadal styl 2 na 10 tego, co by mogło być”", "ocena_data": "2026-11-02",
   "co": "Ujęcia ze stocku pod każde zdanie, grafiki kodem, napisy 1-3 słowa i lektor.",
   "kiedy": "Klient bez nagrań i bez budżetu na AI (np. OZE). W reklamach Clips4you zakaz (patrz 26).",
   "przepis": [
    "Ujęcie Pexels/Pixabay (0 zł) pod każde zdanie lektora.",
    "Grafiki kodem: karty z ikonami, urządzenie, lista 1-2-3, formularz w telefonie.",
    "Napisy 1-3 słowa z żółtym słowem kluczowym.",
    "Lektor ElevenLabs (Tomasz) przyspieszony 1,1x, 27-28 s."
   ],
   "silnik": "motion/c4y/fmb1-3 (script.py)",
   "wzor": "motion/c4y/fmb1",
   "koszt": "ok. 0,3 $ lektor",
   "notatki": ["wiedza/project-oze-fmb-rolki.md"],
   "probka": {"plik": "motion/c4y/fmb1/fmb1.mp4", "plakat": 0.4},
   "przyklady": ["motion/c4y/fmb2/fmb2.mp4", "motion/c4y/fmb3/fmb3.mp4"]
  },
  {
   "nr": 23, "grupa": "format", "nazwa": "Zwiastun kinowy (parodia)", "status": "test", "status_t": "Bez oceny",
   "ocena": "Próbka dla SIX SEVEN, bez oceny", "ocena_data": "2026-10-01",
   "co": "Parodia trailera: „Od twórców hitu…”, pasy kinowe, ziarno, głęboki lektor, muzyka trailerowa.",
   "kiedy": "Gastronomia, produkty z charakterem, marki z poczuciem humoru.",
   "przepis": [
    "Pasy kinowe, ziarno, ciepła kolorystyka, plansze czcionką Cinzel.",
    "Głęboki lektor (Mateusz), muzyka trailerowa ElevenLabs.",
    "Najpiękniejsze ujęcia produktu z materiału klienta, zwolnione.",
    "Koniec: „Już teraz w [miasto]” + hasło marki."
   ],
   "silnik": "motion/c4y/six7b (script.py + six7b.html)",
   "wzor": "motion/c4y/six7b",
   "koszt": "0 zł montażu + lektor i muzyka ElevenLabs",
   "notatki": ["wiedza/project-c4y-probki-leadow.md"],
   "probka": {"plik": "motion/c4y/six7b/six7b.mp4", "plakat": 1},
   "przyklady": []
  },
  {
   "nr": 24, "grupa": "format", "nazwa": "Recenzja jak z TikToka", "status": "test", "status_t": "Bez oceny",
   "ocena": "Próbka dla SIX SEVEN, bez oceny", "ocena_data": "2026-10-01",
   "co": "Film klienta z rodziną, dymki jak w TikToku, „5 minut wcześniej”, pieczątka 10/10 i mem na końcu.",
   "kiedy": "Lokale, gastronomia, usługi rodzinne: luźny, ludzki ton bez lektora.",
   "przepis": [
    "Bez lektora: dźwięk z nagrania + muzyka + efekty (record scratch, vine boom).",
    "Dymki i naklejki jak w TikToku, „⏪ 5 minut wcześniej”.",
    "Pieczątka oceny (10/10 JURY), pinezka z miejscowością od klatki 0.",
    "Mem na końcu w klimacie marki."
   ],
   "silnik": "motion/c4y/six7c (script.py + six7c.html)",
   "wzor": "motion/c4y/six7c",
   "koszt": "ok. 0 zł",
   "notatki": ["wiedza/project-c4y-probki-leadow.md"],
   "probka": {"plik": "motion/c4y/six7c/six7c.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 25, "grupa": "stop", "nazwa": "Viral board (dopamina)", "status": "stop", "status_t": "Przestarzały od 2026-09-26",
   "ocena": "Był wzorcem 2026-09-25, dzień później zastąpiony stylem 17-18: „cofasz się do tamtego stylu”", "ocena_data": "2026-09-26",
   "co": "Kamera po planszy, Segoe Black z obrysem, glitche, liczniki kasynowe.",
   "kiedy": "Nie do nowych rolek. Zostają tylko klocki: liczniki kasynowe i kontrast czerwony/zielony.",
   "przepis": [
    "Powód odrzucenia: wygląda tanio i „dopaminowo” przy stylu 17, który robi efekt ruchem, a nie hałasem."
   ],
   "silnik": "motion/kuba/lib/viral.js + dopa.js",
   "wzor": "motion/kuba/r19v",
   "koszt": "-",
   "notatki": ["wiedza/feedback-reel-retention.md", "wiedza/feedback-kuba-channel-style.md"],
   "probka": {"plik": "motion/kuba/r19v/r19v.mp4", "plakat": 0.4},
   "przyklady": []
  },
  {
   "nr": 26, "grupa": "stop", "nazwa": "Stock bez twarzy w reklamie", "status": "stop", "status_t": "Zakaz w reklamach (2026-10-26)",
   "ocena": "Do 1/4 filmu dotrwało 1-5% widzów (z twarzą 7-18%), 0 leadów", "ocena_data": "2026-10-26",
   "co": "Maszynka: ujęcia ze stocku bez ludzi, grafiki kodem, napisy i lektor.",
   "kiedy": "Nigdy w reklamach Clips4you. U klienta bez nagrań lepiej 09 albo 12.",
   "przepis": [
    "Powód zakazu: brak człowieka = widz nie ma na kim zawiesić oka, średnio 1-2 s oglądania."
   ],
   "silnik": "motion/maszynka/maszynka.py",
   "wzor": "motion/maszynka/filmy/N01",
   "koszt": "-",
   "notatki": ["wiedza/feedback-zakaz-montaz-stock-bez-twarzy.md"],
   "probka": {"plik": "motion/maszynka/filmy/N01/N01.mp4", "plakat": 0.4},
   "przyklady": []
  }
 ],
 "wzorce_opis": "Filmy-outliery z 59 kont z researchu (ok. 3 500 filmów, 2026-11-02): wyświetlenia podzielone przez medianę konta. Kopiujemy mechanizm, nie film.",
 "wzorce": [
  {"nr": "W01", "nazwa": "Pytanie właściciela, diagnoza eksperta", "konto": "Alex Hormozi", "platforma": "YouTube", "link": "https://www.youtube.com/shorts/1PFL0Xh19FU", "wysw": 225000, "x": 6.6, "mediana": 34000, "ciecia": 41,
   "co": "Na evencie właścicielka firmy podaje swoje liczby (25 tys. $ na reklamy, 500 tys. $ przychodu) i pyta, jak odciąć firmę od siebie. Hormozi kilkoma pytaniami znajduje prawdziwy problem.",
   "mechanizm": ["Na górze stały nagłówek w czerwonej ramce = jej pytanie, widoczny od klatki 0.", "Pierwsze zdanie to liczby z jej firmy: widz od razu wie, że to prawdziwy biznes.", "Ekspert nie odpowiada od razu, dopytuje (ilu klientów, co blokuje) i dopiero nazywa problem.", "Cięcia między pytającą a ekspertem co ok. 3 s, napisy słowo po słowie z żółtym słowem kluczowym.", "Koniec: konkretna rada z liczbą."],
   "kopiujemy": "Rolki Clips4you z prawdziwymi pytaniami właścicieli firm z naszych rozmów (transkrypcje z wtyczki Rozmowy) i odpowiedzią eksperta. U klientów-ekspertów: lekarz odpowiada na pytanie pacjenta.",
   "probka": {"plik": "dane/research-profili/filmy/W01.mp4", "plakat": 1}},
  {"nr": "W02", "nazwa": "Pytanie-hak i odpowiedź pod prąd", "konto": "The Diary Of A CEO", "platforma": "TikToku", "link": "https://www.tiktok.com/@steven/video/7694164672437685526", "wysw": 2700000, "x": 46.2, "mediana": 58400, "ciecia": 10,
   "co": "Klip z podcastu: prowadzący pyta, czego nie robić z pieniędzmi, jeśli chce się być bogatym. Ekspert odpowiada wbrew intuicji (nie kupuj domu) i liczy koszty.",
   "mechanizm": ["Klatka 0: twarz prowadzącego i biała ramka z tytułem „największy błąd finansowy”.", "Odpowiedź łamie powszechne przekonanie w pierwszych 5 s.", "Dowód liczbami z życia (rata, nowy dach za 20 tys. $).", "Dwie kamery: ekspert i reakcja prowadzącego, cięcie co 5-6 s, napisy po 1-3 słowa na dole.", "60 s, jedna myśl, bez muzyki pod rozmową."],
   "kopiujemy": "Rolki z ekspertami klientów (lekarz Kolmedu, terapeuta Żółtego Szalika): jedno pytanie „największy błąd przy…” i odpowiedź pod prąd. Prowadzącym może być nasza postać AI.",
   "probka": {"plik": "dane/research-profili/filmy/W02.mp4", "plakat": 1}},
  {"nr": "W03", "nazwa": "News biznesowy z memami i dowodami", "konto": "Morning Brew", "platforma": "TikToku", "link": "https://www.tiktok.com/@morningbrew/video/7640108919335030029", "wysw": 3500000, "x": 30.6, "mediana": 114550, "ciecia": 31,
   "co": "Prowadzący przy biurku tłumaczy w 2 minuty spór o centrum danych w Utah, przeplatając go memami, wycinkami artykułów i wyszukiwarką.",
   "mechanizm": ["Stały tytuł w białej ramce u góry przez cały film.", "Pierwsze zdanie: znana osoba i zaskakujące pytanie.", "Co 3-4 s wstawka: mem, zrzut artykułu z podkreśleniem, zrzut z Google, siatka ikon zamiast liczby.", "Ironiczny ton, jedna kamera, zwykły pokój zamiast studia.", "Każda liczba ma dowód na ekranie (źródło)."],
   "kopiujemy": "Rolki Clips4you o newsach z rynku reklam i firm w Polsce (zmiany w Mecie, ceny leadów) z wycinkami źródeł. U klientów z branży prawnej i finansowej.",
   "probka": {"plik": "dane/research-profili/filmy/W03.mp4", "plakat": 1}},
  {"nr": "W04", "nazwa": "Skecz z życia twórcy", "konto": "Iman Gadzhi (konto Unscripted)", "platforma": "TikToku", "link": "https://www.tiktok.com/@imangadzhi/video/7694300980669598998", "wysw": 4900000, "x": 51.8, "mediana": 94550, "ciecia": 22,
   "co": "Dziewczyny przeszukują samochód Imana i znajdują „cudze” gumki do włosów. Krótki skecz z czarnym paskiem tytułu u góry.",
   "mechanizm": ["Czarny pasek z tytułem nad obrazem przez cały film.", "Cięcia co 1,3 s, kilka osób, każda ma jedną kwestię.", "Humor z relacji, który każdy zna; w tle styl życia (auto, Londyn) jako cicha reklama marki.", "Napisy słowo po słowie na środku, puenta w ostatnich 2 s."],
   "kopiujemy": "Na zasięg, nie na leady: skecze z życia właściciela firmy na konto Clips4you (np. co klient znajduje w telefonie szefa). Buduje rozpoznawalność, nie sprzedaje oferty.",
   "probka": {"plik": "dane/research-profili/filmy/W04.mp4", "plakat": 1}},
  {"nr": "W05", "nazwa": "Reklama B2B: twarz, kartka, ekran", "konto": "Chris Do", "platforma": "TikToku", "link": "https://www.tiktok.com/@thechrisdo/video/7602424354856537358", "wysw": 21800000, "x": 1458.2, "mediana": 14950, "ciecia": 12,
   "co": "Chris Do przedstawia narzędzie LinkedIna do rekrutacji: obiecuje pokazać coś, co zmienia grę, wypisuje nazwę markerem na kartce, pokazuje ekran, ból małej firmy, wizję i wezwanie.",
   "mechanizm": ["Hak: ekspert patrzy w kamerę i obiecuje coś pokazać (2 s).", "Nazwa produktu pisana markerem na kolorowej kartce: tanio i nie wygląda jak reklama.", "Nagranie ekranu produktu z wyróżnionymi słowami.", "Lista bólu właściciela małej firmy (zła rekrutacja, setki złych kandydatów, stracone godziny), potem „wyobraź sobie…”.", "Napisy pod twarzą, muzyka w tle ledwo słyszalna."],
   "kopiujemy": "Nasze reklamy Meta dla właścicieli firm: ekspert (nasza postać AI) + ręcznie pisana kartka „Clips4you” + nagranie panelu klienta + lista bólu wzięta z rozmów.",
   "uwaga": "To płatna reklama LinkedIna (#LinkedInPartner): wyświetlenia są kupione. Bierzemy budowę reklamy, nie dowód zasięgu.",
   "probka": {"plik": "dane/research-profili/filmy/W05.mp4", "plakat": 1}},
  {"nr": "W06", "nazwa": "Satysfakcjonujący proces od brudu do efektu", "konto": "MM Plumber (hydraulik)", "platforma": "TikToku", "link": "https://www.tiktok.com/@mm_plumber/video/7608089610589048086", "wysw": 19100000, "x": 44.8, "mediana": 425900, "ciecia": 16,
   "co": "Hydraulik wycina spleśniały silikon przy wannie i kładzie nowy. Bez słowa, tylko dźwięk narzędzi, 74 s.",
   "mechanizm": ["Klatka 0: brzydki problem w zbliżeniu, nóż już w ruchu, zero wstępu.", "Każdy krok w jednym dłuższym ujęciu (śr. 4,4 s), ręce i narzędzie blisko kamery.", "Dźwięk narzędzi zamiast muzyki i lektora (ASMR).", "Narzędzia i produkty widać z nazwą (naturalne lokowanie).", "Koniec: czysty efekt i kciuk w górę przy produktach."],
   "kopiujemy": "Rolki klientów z usług (Izzi Therm, OZE, budowlanka, sprzątanie, warsztaty): klient nagrywa telefonem jeden proces od A do Z, my tniemy i podbijamy dźwięk. Bez lektora i bez kosztów AI.",
   "probka": {"plik": "dane/research-profili/filmy/W06.mp4", "plakat": 1}},
  {"nr": "W07", "nazwa": "Lekarz reaguje na cudzy viral", "konto": "Dr Karan Rajan", "platforma": "TikToku", "link": "https://www.tiktok.com/@dr.karanr/video/7659493746349837590", "wysw": 4100000, "x": 30.8, "mediana": 133150, "ciecia": 24,
   "co": "Lekarz bierze popularny film pary, która szykuje się do ciąży, i wyjaśnia, co nawyki przyszłego taty robią dziecku, z badaniem na ekranie.",
   "mechanizm": ["Start od cudzego viralu na pełnym ekranie, lekarz mały w rogu (green screen).", "Potem lekarz wycięty z tła na czarnym, wokół ikony i obrazki (kalendarz, burger, papieros z X).", "Zrzut badania z podkreśleniem jako dowód.", "Humor w słowach, cięcie co 3,4 s.", "Na końcu powrót do cudzego filmu (klamra)."],
   "kopiujemy": "Kolmed i inne kliniki: lekarz reaguje na popularne mity zdrowotne. Jedno nagranie lekarza na jednolitym tle raz w miesiącu, reszta to montaż (styl 01 + green screen).",
   "probka": {"plik": "dane/research-profili/filmy/W07.mp4", "plakat": 1}},
  {"nr": "W08", "nazwa": "Ekspert ocenia błąd widza", "konto": "Dr Pimple Popper", "platforma": "TikToku", "link": "https://www.tiktok.com/@drpimplepopper/video/7659504852757777694", "wysw": 2800000, "x": 10.1, "mediana": 278050, "ciecia": 1,
   "co": "Lekarka w rogu ekranu komentuje nagranie widza, który wyciska cystę na kanapie: nie wyciskaj, idź na wycięcie.",
   "mechanizm": ["Cudze nagranie problemu na pełnym ekranie od klatki 0.", "Ekspertka mała w rogu, mówi spontanicznie, jak do znajomego.", "Jedno ujęcie, zero montażu, 18 s.", "Puenta = jasna rada („idź do specjalisty”), która kieruje do kliniki."],
   "kopiujemy": "Najtańszy format dla klinik: lekarz nagrywa 15-20 s komentarza do nadesłanego albo publicznego nagrania. Potrzebne zgody i ostrożność z prawem reklamy usług medycznych.",
   "probka": {"plik": "dane/research-profili/filmy/W08.mp4", "plakat": 1}},
  {"nr": "W09", "nazwa": "Ludzka strona placówki", "konto": "Cleveland Clinic", "platforma": "TikToku", "link": "https://www.tiktok.com/@clevelandclinic/video/7700964832694029598", "wysw": 32500, "x": 44.1, "mediana": 736, "ciecia": 12,
   "co": "Parada wcześniaków przebranych na Halloween na oddziale noworodków, każde dziecko z ciepłym podpisem.",
   "mechanizm": ["Zero wykładu medycznego: emocja i święto zamiast porady.", "Seria krótkich ujęć tego samego typu (każde dziecko w innym przebraniu) z jednym podpisem.", "Wpięte w datę (Halloween), której ludzie właśnie szukają.", "Z danych: dwa największe hity tego konta w ostatnich 60 postach to pokazy zdjęć (karuzele), nie filmy."],
   "kopiujemy": "Kliniki i firmy usługowe: raz w miesiącu treść „od kuchni” na święto (Mikołajki, Dzień Matki), seria zdjęć albo ujęć z podpisami. Karuzela zdjęć jako tani test.",
   "uwaga": "Wymaga zgód na wizerunek. U nas raczej personel niż pacjenci.",
   "probka": {"plik": "dane/research-profili/filmy/W09.mp4", "plakat": 1}},
  {"nr": "W10", "nazwa": "Miejsce w 15 sekund", "konto": "SERHANT. (nieruchomości)", "platforma": "TikToku", "link": "https://www.tiktok.com/@serhant/video/7693318477335121165", "wysw": 478200, "x": 257.2, "mediana": 1859, "ciecia": 11,
   "co": "Ulica, kamera jedzie w górę po fasadzie, potem szybki przelot przez pokoje mieszkania w Nowym Jorku pod popularną muzykę.",
   "mechanizm": ["Najpierw z zewnątrz (budynek z ulicy), potem wnętrza: widz wchodzi razem z kamerą.", "Cięcie co 1,4 s w rytm modnego dźwięku.", "Bez lektora, jedno zdanie u góry.", "Nagrane telefonem, 17 s."],
   "kopiujemy": "Nieruchomości, kliniki, hotele, salony, gabinety: „wejdź z nami” w 15 s z telefonu klienta. Najprostsza rolka, jaką może nagrać każdy klient.",
   "probka": {"plik": "dane/research-profili/filmy/W10.mp4", "plakat": 1}},
  {"nr": "W11", "nazwa": "Newsjacking nagłówkiem", "konto": "carwow", "platforma": "TikToku", "link": "https://www.tiktok.com/@carwow/video/7697072050023845152", "wysw": 3400000, "x": 39.2, "mediana": 86700, "ciecia": 1,
   "co": "Nagranie z prezentacji nowej Tesli z nagłówkiem „REVEALED: nowy Tesla Roadster, potrafi LATAĆ?!” i samą muzyką.",
   "mechanizm": ["Wrzucone w dniu newsa, zanim temat ostygnie.", "Jeden duży nagłówek z pytaniem i emoji przez cały film.", "Materiał źródłowy prawie bez montażu (1 cięcie).", "Ciekawość: widz ogląda do końca, żeby sprawdzić, czy naprawdę lata."],
   "kopiujemy": "Klienci z branż, gdzie dzieje się news (auta, dotacje OZE, prawo): rolka w 24 h od newsa z nagłówkiem-pytaniem. U nas: newsy z Mety i rynku reklam.",
   "probka": {"plik": "dane/research-profili/filmy/W11.mp4", "plakat": 1}},
  {"nr": "W12", "nazwa": "Wyzwanie dwóch postaci", "konto": "Żabka", "platforma": "TikToku", "link": "https://www.tiktok.com/@zabkapolska/video/7662739524644031776", "wysw": 9600000, "x": 10.1, "mediana": 947000, "ciecia": 48,
   "co": "Dwóch bohaterów marki na kocu robi rysunkowy challenge z produktami Żabki, w środku promocja happy hours.",
   "mechanizm": ["Stałe postacie marki, znane z poprzednich filmów.", "Gra z zasadami i wynikiem: widz czeka, kto wygra.", "Cięcie co 0,9 s, wstawki (Mona Lisa z jedzeniem), luźny polski język.", "Promocja wpleciona w zabawę, nie doklejona na końcu."],
   "kopiujemy": "Polski punkt odniesienia: format „wyzwanie” dla klientów B2C (gastronomia, sklepy); dla Clips4you dwie stałe postacie AI w serii.",
   "probka": {"plik": "dane/research-profili/filmy/W12.mp4", "plakat": 1}},
  {"nr": "W13", "nazwa": "Kolaboracja z dziwnym twórcą", "konto": "Chipotle", "platforma": "TikToku", "link": "https://www.tiktok.com/@chipotle/video/7693220815684291853", "wysw": 15400000, "x": 101.1, "mediana": 152300, "ciecia": 23,
   "co": "Orkiestra grająca na warzywach (awokado, papryka, kukurydza) gra na składnikach Chipotle; pełny film w linku w bio.",
   "mechanizm": ["Pierwsze zdanie = absurdalne pytanie („czemu gramy na warzywach?”).", "Produkt marki staje się czymś innym (instrumentem).", "Cięcie co 1,4 s, memiczne wstawki.", "Twórca z niszy przynosi swoją publiczność."],
   "kopiujemy": "Klienci B2C: produkt w nieoczekiwanej roli + lokalny twórca z niszy. Dla Clips4you raczej inspiracja do hooków niż format.",
   "probka": {"plik": "dane/research-profili/filmy/W13.mp4", "plakat": 1}},
  {"nr": "W14", "nazwa": "Mem w 6 sekund", "konto": "Ryanair", "platforma": "TikToku", "link": "https://www.tiktok.com/@ryanair/video/7690989972043746582", "wysw": 2900000, "x": 19.4, "mediana": 149800, "ciecia": 0,
   "co": "Jedno ujęcie samolotu i dwie linijki tekstu nawiązujące do newsa dnia o Ronaldo: skoro on usiedzi 90 minut, ty też.",
   "mechanizm": ["Jedno ujęcie z archiwum marki, zero produkcji.", "Tekst nawiązuje do tematu, o którym wszyscy dziś mówią.", "Autoironia marki (ciasne fotele).", "6,5 s: film leci w pętli kilka razy, co podbija wynik."],
   "kopiujemy": "Najtańszy format na konto Clips4you i klientów z poczuciem humoru: ujęcie z archiwum + 2 linijki o newsie dnia. Kilka minut pracy.",
   "probka": {"plik": "dane/research-profili/filmy/W14.mp4", "plakat": 1}},
  {"nr": "W15", "nazwa": "Hook AI z prawdziwej klatki", "konto": "Artlist", "platforma": "TikToku", "link": "https://www.tiktok.com/@artlist.io/video/7620550990105709838", "wysw": 126100000, "x": 253.3, "mediana": 497850, "ciecia": 10,
   "co": "Twórca stoi ze statywem na polu, wiatr AI go porywa, a potem pokazuje, jak to zrobić: klatka z nagrania, model wideo (Kling), prompt, napis i lektor.",
   "mechanizm": ["Klatka 0: zwykłe ujęcie zza kulis i ironiczny napis („bro myśli, że jest twórcą”).", "Po 3 s niemożliwe zdarzenie AI na tej samej scenie.", "Potem poradnik krok po kroku na ekranie telefonu i komputera.", "Drugi hak: „tracisz, jeśli tego nie robisz”."],
   "kopiujemy": "Nasz styl 16 (filmowy wstęp) w tańszej wersji: klatka z prawdziwego nagrania klienta, jedno zdarzenie AI na 3-5 s, potem zwykła rolka. Tak robi Higgsfield.",
   "uwaga": "126 mln wyświetleń przy medianie 0,5 mln: prawie na pewno płatna promocja. Mechanizm hooka i tak jest dobry.",
   "probka": {"plik": "dane/research-profili/filmy/W15.mp4", "plakat": 1}},
  {"nr": "W16", "nazwa": "Zdjęcie zamienione w animację", "konto": "Pika", "platforma": "TikToku", "link": "https://www.tiktok.com/@pika/video/7520364805484530999", "wysw": 392100, "x": 52.6, "mediana": 7454, "ciecia": 4,
   "co": "Zwykłe zdjęcie rodziny u góry, ta sama scena jako ruchoma animacja AI na dole, napis „wgraj dowolne zdjęcie”.",
   "mechanizm": ["Przed i po jednocześnie: ekran podzielony na zdjęcie i wersję AI.", "Jeden krótki napis-instrukcja w rogu.", "Ciepłe, osobiste zdjęcia (dzieci, wakacje), nie produkty.", "18 s, muzyka, koniec z logo."],
   "kopiujemy": "Pokaz możliwości Clips4you dla leadów: zdjęcie z firmy klienta (ze strony) zamienione w ruchomą scenę. Też tani hook w rolkach klientów.",
   "probka": {"plik": "dane/research-profili/filmy/W16.mp4", "plakat": 1}},
  {"nr": "W17", "nazwa": "Absurdalne stworzenie AI w zwykłej scenie", "konto": "Kling AI", "platforma": "TikToku", "link": "https://www.tiktok.com/@klingai_official/video/7666013667678375189", "wysw": 1100000, "x": 9.0, "mediana": 122850, "ciecia": 3,
   "co": "Maleńki kot ze skrzydłami komara ląduje mężczyźnie na ręce, on patrzy zdziwiony i bierze go na dłoń. Bez słów.",
   "mechanizm": ["Realistyczna, zwykła scena w domu + jeden niemożliwy element.", "Zero tekstu i lektora: działa w każdym języku.", "Urocze zwierzę = udostępnienia.", "Poziomy kadr i mimo to ponad milion wyświetleń: liczy się pomysł."],
   "kopiujemy": "Hooki rolek klientów: jeden absurdalny, uroczy element AI związany z branżą (np. mała „żywa” paczka dla firmy kurierskiej). Wiralowy styl bez dużych kosztów.",
   "probka": {"plik": "dane/research-profili/filmy/W17.mp4", "plakat": 1}}
 ]
};
