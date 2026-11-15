r"""Clips4you YouTube film 1: "Wszystkie rolki na miesiąc w 1 godzinę" (16:9, mini-VSL, animacje SaaS w stylu clips4you.pl,
bez AI wideo i bez awatarów; jedyny koszt = głos ElevenLabs "Adam").  Scenariusz: ../scenariusze-01-03.md
  ..\..\..\..\runtime\python.exe script.py voice timing     (głos per rozdział, pauzy przycięte kit.tighten)
  script.py stills  /  script.py audio  /  script.py render mux
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import c4yfilm  # noqa: E402

NAME = "f1"
CHAPTERS = [
    ("hook", "Hook", [
        ("h1", "Jedna godzina rozmowy. Trzydzieści rolek na cały miesiąc."),
        ("h2", "Tak robimy rolki dla firm, które nie mają na nie czasu. Pokażemy Ci dokładnie, jak to działa."),
        ("h3", "Cztery kroki. A na końcu jedno pytanie, które zadajemy każdemu klientowi."),
        ("h4", "Z odpowiedzi na nie powstaje najważniejsza rolka na Twoim profilu.")]),
    ("lustro", "Problem", [
        ("l1", "Wiesz, że Twoja firma powinna wrzucać rolki."),
        ("l2", "Klienci je oglądają. Konkurencja je wrzuca."),
        ("l3", "Tylko kiedy? W dzień obsługujesz klientów. Wieczorem faktury i telefony."),
        ("l4", "A jedna rolka to temat, nagranie, montaż, napisy i opis."),
        ("l5", "Wrzucasz jedną. A potem trzy tygodnie ciszy.")]),
    ("ludzie", "Zespół", [
        ("p1", "Firmy, które wrzucają codziennie, nie mają więcej czasu niż Ty."),
        ("p2", "Mają za sobą ludzi. Ktoś wymyśla tematy, ktoś montuje, ktoś publikuje."),
        ("p3", "My jesteśmy tymi ludźmi. Od Ciebie potrzebujemy jednej godziny w miesiącu."),
        ("p4", "Zobacz, jak ona wygląda.")]),
    ("k1", "1. Rozmowa", [
        ("a1", "Krok pierwszy. Rozmowa."),
        ("a2", "Łączymy się online na godzinę. Niczego nie przygotowujesz i nie piszesz scenariuszy."),
        ("a3", "My pytamy. Ty odpowiadasz tak, jak odpowiadasz klientom."),
        ("a4", "Pytamy o to, o co pytają Cię klienci. Ile to kosztuje? Ile trwa? Jaki błąd ludzie popełniają najczęściej?"),
        ("a5", "Jedna dobra odpowiedź to jedna rolka. W godzinę odpowiadasz na ponad trzydzieści pytań."),
        ("a6", "Dla Ciebie to zwykła rozmowa o pracy. Dla klienta to odpowiedź na pytanie, z którym i tak by do Ciebie zadzwonił."),
        ("a7", "A pytanie z końca rozmowy? Za chwilę.")]),
    ("k2", "2. Wybór", [
        ("b1", "Krok drugi. Wybór."),
        ("b2", "Z godzinnego nagrania wycinamy najlepsze fragmenty, po dwadzieścia, czterdzieści sekund."),
        ("b3", "Każdy ma jedną myśl i mocne pierwsze zdanie. Bo na Instagramie masz sekundę, żeby ktoś się zatrzymał."),
        ("b4", "Nie oglądasz godzinnego nagrania. Dostajesz gotowe rolki.")]),
    ("k3", "3. Montaż", [
        ("c1", "Krok trzeci. Montaż."),
        ("c2", "Napisy, bo wiele osób ogląda bez dźwięku. Zbliżenia. Muzyka. Okładka."),
        ("c3", "Tak wyglądają gotowe rolki.")]),
    ("k4", "4. Publikacja", [
        ("d1", "Krok czwarty. Publikacja."),
        ("d2", "Rolki dostajesz do akceptacji. Coś nie pasuje? Poprawiamy."),
        ("d3", "Potem publikujemy je za Ciebie, codziennie. Instagram, Facebook, TikTok i YouTube."),
        ("d4", "Przez cały miesiąc Twoja firma jest widoczna każdego dnia. A Ty w tym czasie prowadzisz firmę.")]),
    ("pyt", "Pytanie", [
        ("q1", "A teraz obiecane pytanie. Zadajemy je na samym końcu każdej rozmowy."),
        ("q2", "Co chcesz, żeby każdy klient wiedział, zanim do Ciebie zadzwoni?"),
        ("q3", "Z tej odpowiedzi robimy rolkę, którą przypinamy na górze profilu."),
        ("q4", "Ktoś wchodzi na Twój profil i od razu wie, dlaczego warto wybrać właśnie Ciebie.")]),
    ("my", "Kim jesteśmy", c4yfilm.ENDING),
]
GAPS = {"@lustro": .55, "@ludzie": .5, "@k1": .6, "@k2": .6, "@k3": .6, "@k4": .6, "@pyt": .7, "@my": .7,
        "a1": .25, "b1": .25, "c1": .25, "d1": .25}

if __name__ == "__main__":
    c4yfilm.main(HERE, NAME, CHAPTERS, GAPS, music="saas_long.mp3")

TITLE = "Wszystkie rolki na miesiąc w 1 godzinę"
if "pakiet" in sys.argv:
    c4yfilm.package(HERE, NAME, TITLE, ["30 rolek z jednej godziny", "Rolki na cały miesiąc w godzinę"],
        "Nie masz czasu na rolki? Pokazujemy krok po kroku, jak z jednej godziny rozmowy robimy 30 rolek na cały miesiąc i publikujemy je codziennie za Ciebie. Bez scenariuszy i bez przygotowań.",
        {"hook": "1 godzina = 30 rolek", "lustro": "Dlaczego nie wrzucasz rolek", "ludzie": "Kto stoi za firmami, które wrzucają codziennie", "k1": "Krok 1: rozmowa",
         "k2": "Krok 2: wybór fragmentów", "k3": "Krok 3: montaż", "k4": "Krok 4: publikacja", "pyt": "Pytanie, które zadajemy każdemu klientowi", "my": "Kim jesteśmy i jak wygląda miesiąc z nami"},
        "rolki dla firmy, rolki na instagram, rolki instagram firma, jak robić rolki, montaż rolek, krótkie filmy dla firmy, reels dla firmy, marketing na instagramie, tiktok dla firmy, content dla firmy, social media dla firm, wideo marketing, rolki facebook, youtube shorts dla firmy, clips4you",
        "Jakie pytanie najczęściej zadają Ci klienci? Napisz w komentarzu, a pokażemy, jaką rolkę zrobilibyśmy z odpowiedzi 👇")
    c4yfilm.export(HERE, NAME, TITLE, [os.path.join(HERE, "thumb", "t1.png"), os.path.join(HERE, "thumb", "t2.png")], os.path.join(HERE, "thumb", "prompty-ai.txt"),
                   tg_send="--bez-tg" not in sys.argv)
