r"""Clips4you YouTube film 3: "Jak rolki zamieniają się w telefony" (16:9, mini-VSL). Droga klienta w 4 krokach
(zauważa -> widzi znowu -> potrzebuje -> sprawdza profil -> dzwoni) + pętla: miejsce, w którym firmy przerywają drogę
(payoff: poddają się po 5 rolkach, zanim klient je zapamięta) -> dlatego 30 rolek i codziennie.
  ..\..\..\..\runtime\python.exe script.py voice timing  /  stills  /  audio render mux
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import c4yfilm  # noqa: E402

NAME = "f3"
CHAPTERS = [
    ("hook", "Hook", [
        ("h1", "Rolka ma sens tylko wtedy, gdy po niej dzwoni telefon."),
        ("h2", "Pokażemy Ci drogę od pierwszego obejrzenia do telefonu."),
        ("h3", "I miejsce, w którym większość firm tę drogę przerywa. Zostań do końca.")]),
    ("lustro", "Problem", [
        ("l1", "Wrzuciłeś kilka rolek. Były wyświetlenia, parę serduszek. A telefon milczał."),
        ("l2", "Wniosek: w mojej branży rolki nie działają."),
        ("l3", "Tylko że jedna rolka prawie nigdy nie przynosi telefonu. Telefon przynosi seria.")]),
    ("k1", "1. Zauważa", [
        ("a1", "Krok pierwszy. Zauważa Cię."),
        ("a2", "Ktoś przewija Instagram i widzi Twoją twarz. Nie zna Cię i dziś Cię nie potrzebuje."),
        ("a3", "Ale zapamiętuje, że jest ktoś taki jak Ty.")]),
    ("k2", "2. Widzi znowu", [
        ("b1", "Krok drugi. Widzi Cię znowu."),
        ("b2", "Przez kolejne tygodnie trafia na Twoje rolki. Odpowiadasz na pytanie, które sam miał. Pokazujesz realizację. Mówisz, ile coś trwa."),
        ("b3", "Zaczyna mieć wrażenie, że Cię zna."),
        ("b4", "Zapamiętaj ten krok. Właśnie tu większość firm się poddaje.")]),
    ("k3", "3. Potrzebuje", [
        ("c1", "Krok trzeci. Pojawia się potrzeba."),
        ("c2", "Pewnego dnia potrzebuje kogoś takiego jak Ty. I nie szuka długo."),
        ("c3", "Przypomina sobie twarz, którą zna. Klienci nie wybierają najlepszego fachowca. Wybierają tego, którego już widzieli.")]),
    ("k4", "4. Sprawdza profil", [
        ("d1", "Krok czwarty. Sprawdza Twój profil."),
        ("d2", "Ostatnia rolka sprzed trzech miesięcy? Wraca do konkurencji."),
        ("d3", "Rolki z tego tygodnia? Dzwoni.")]),
    ("pyt", "Gdzie firmy się poddają", [
        ("q1", "Dlaczego więc firmy się poddają?"),
        ("q2", "Wrzucają pięć rolek, nie widzą telefonów i przestają. Zanim klient zdążył je zapamiętać."),
        ("q3", "Dlatego robimy trzydzieści rolek w miesiącu i publikujemy codziennie. Tak, żeby klient zdążył Cię zapamiętać.")]),
    ("my", "Kim jesteśmy", c4yfilm.ENDING),
]
GAPS = {"@lustro": .55, "@k1": .6, "@k2": .6, "@k3": .6, "@k4": .6, "@pyt": .7, "@my": .7,
        "a1": .25, "b1": .25, "c1": .25, "d1": .25, "d3": .4}

if __name__ == "__main__":
    c4yfilm.main(HERE, NAME, CHAPTERS, GAPS, music="saas_long.mp3")

TITLE = "Jak rolki zamieniają się w telefony"
if "pakiet" in sys.argv:
    c4yfilm.package(HERE, NAME, TITLE, ["Od rolki do telefonu", "Dlaczego rolki nie dają telefonów"],
        "Wrzuciłeś kilka rolek, były wyświetlenia, a telefon milczał? Pokazujemy drogę klienta od pierwszego obejrzenia do telefonu w 4 krokach i miejsce, w którym większość firm tę drogę przerywa.",
        {"hook": "Rolka ma sens, gdy dzwoni telefon", "lustro": "Dlaczego jedna rolka nie wystarcza", "k1": "Krok 1: klient Cię zauważa", "k2": "Krok 2: widzi Cię znowu",
         "k3": "Krok 3: pojawia się potrzeba", "k4": "Krok 4: sprawdza Twój profil", "pyt": "Gdzie firmy się poddają", "my": "Kim jesteśmy i jak wygląda miesiąc z nami"},
        "rolki dla firmy, jak zdobyć klientów z instagrama, klienci z rolek, rolki a sprzedaż, marketing na instagramie, jak często wrzucać rolki, rolki nie działają, reels dla firmy, tiktok dla firmy, klienci z social media, marketing lokalnej firmy, social media dla firm, clips4you",
        "Ile rolek wrzuciłeś, zanim przestałeś? Napisz szczerze w komentarzu 👇")
    c4yfilm.export(HERE, NAME, TITLE, [os.path.join(HERE, "thumb", "t1.png"), os.path.join(HERE, "thumb", "t2.png")], os.path.join(HERE, "thumb", "prompty-ai.txt"),
                   tg_send="--bez-tg" not in sys.argv)
