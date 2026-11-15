r"""Clips4you YouTube film 2: "Ile kosztują rolki dla firmy" (16:9, mini-VSL). 5 sposobów na 30 rolek w miesiącu:
sam / montażysta na zlecenie / montażysta na etat / agencja / my. NASZYCH CEN NIE PODAJEMY (decyzja 2026-09-30: ceny tylko
na stronie), u nas liczymy Twój czas: 1 godzina. Pętla: najdroższa rolka nie jest na liście (payoff: ta, której nie wrzuciłeś).
  ..\..\..\..\runtime\python.exe script.py voice timing  /  stills  /  audio render mux
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import c4yfilm  # noqa: E402

NAME = "f2"
CHAPTERS = [
    ("hook", "Hook", [
        ("h1", "Ile naprawdę kosztuje rolka dla firmy?"),
        ("h2", "Policzyliśmy pięć sposobów. Od zera złotych do kilkunastu tysięcy miesięcznie."),
        ("h3", "A najdroższa rolka? Nie ma jej na tej liście. Powiemy na końcu.")]),
    ("lustro", "Problem", [
        ("l1", "Pytasz o cenę i słyszysz wszystko. Od pięćdziesięciu złotych do kilku tysięcy."),
        ("l2", "Nikt nie mówi, co jest w środku."),
        ("l3", "Policzmy to na jednym przykładzie. Firma, która chce trzydzieści rolek w miesiącu. Czyli jedną dziennie.")]),
    ("s1", "1. Sam", [
        ("a1", "Sposób pierwszy. Robisz to sam, telefonem."),
        ("a2", "Kosztuje zero złotych. Tylko że jedna rolka to temat, nagranie, montaż i napisy."),
        ("a3", "Realnie godzina, często dwie. Trzydzieści rolek to od trzydziestu do sześćdziesięciu godzin w miesiącu."),
        ("a4", "Jeśli godzina Twojej pracy jest warta sto pięćdziesiąt złotych, te rolki kosztują Cię od czterech i pół do dziewięciu tysięcy."),
        ("a5", "I zwykle kończy się na trzech.")]),
    ("s2", "2. Na zlecenie", [
        ("b1", "Sposób drugi. Montażysta na zlecenie."),
        ("b2", "Płacisz za sztukę. Ale montażysta montuje tylko to, co mu wyślesz."),
        ("b3", "Tematy, nagrywanie i publikacja dalej są na Twojej głowie. A to one zabierają najwięcej czasu.")]),
    ("s3", "3. Etat", [
        ("c1", "Sposób trzeci. Montażysta na etat."),
        ("c2", "Sześć do ośmiu tysięcy złotych miesięcznie, razem z kosztami pracodawcy."),
        ("c3", "Do tego sprzęt, urlopy i ktoś, kto musi mu mówić, co ma robić. Czyli Ty.")]),
    ("s4", "4. Agencja", [
        ("d1", "Sposób czwarty. Agencja marketingowa."),
        ("d2", "Rolki w pakiecie z postami, raportami i spotkaniami."),
        ("d3", "W Polsce za cztery rolki płacisz zwykle od tysiąca dwustu do trzech tysięcy złotych."),
        ("d4", "Przy trzydziestu rolkach to kilkanaście tysięcy miesięcznie.")]),
    ("s5", "5. My", [
        ("m1", "Sposób piąty. Tak, jak robimy to my."),
        ("m2", "Jedna godzina Twojego czasu w miesiącu. Trzydzieści rolek. Publikacja codziennie."),
        ("m3", "Bez etatu, bez sprzętu i bez umowy na rok. Aktualny cennik jest na naszej stronie.")]),
    ("pyt", "Najdroższa rolka", [
        ("q1", "A teraz obiecana odpowiedź. Która rolka kosztuje najwięcej?"),
        ("q2", "Ta, której nie wrzuciłeś."),
        ("q3", "Klient, który szukał dokładnie Ciebie, zadzwonił do firmy, którą widział wczoraj na Instagramie."),
        ("q4", "Tej straty nie zobaczysz na żadnej fakturze.")]),
    ("my", "Kim jesteśmy", c4yfilm.ENDING),
]
GAPS = {"@lustro": .55, "@s1": .6, "@s2": .6, "@s3": .6, "@s4": .6, "@s5": .6, "@pyt": .7, "@my": .7,
        "a1": .25, "b1": .25, "c1": .25, "d1": .25, "m1": .25, "q2": .5}

if __name__ == "__main__":
    c4yfilm.main(HERE, NAME, CHAPTERS, GAPS, music="saas_long.mp3")

TITLE = "Ile kosztują rolki dla firmy"
if "pakiet" in sys.argv:
    c4yfilm.package(HERE, NAME, TITLE, ["Prawdziwy koszt rolek dla firmy", "5 sposobów na rolki dla firmy"],
        "Ile naprawdę kosztuje 30 rolek w miesiącu? Porównujemy 5 sposobów: robisz sam, montażysta na zlecenie, montażysta na etat, agencja marketingowa i nasz sposób. Liczymy nie tylko złotówki, ale też Twój czas. Na końcu: która rolka kosztuje najwięcej.",
        {"hook": "Ile kosztuje rolka", "lustro": "Dlaczego każdy podaje inną cenę", "s1": "Sposób 1: sam, telefonem", "s2": "Sposób 2: montażysta na zlecenie",
         "s3": "Sposób 3: montażysta na etat", "s4": "Sposób 4: agencja marketingowa", "s5": "Sposób 5: Clips4you", "pyt": "Najdroższa rolka", "my": "Kim jesteśmy i jak wygląda miesiąc z nami"},
        "ile kosztują rolki, cena rolek, rolki dla firmy cena, koszt montażu rolek, montażysta rolek, montażysta cena, agencja social media cena, ile kosztuje agencja marketingowa, rolki na instagram, reels dla firmy, marketing na instagramie, tiktok dla firmy, social media dla firm, clips4you",
        "Który sposób próbowałeś do tej pory: sam, montażysta czy agencja? Napisz, jak Ci poszło 👇")
    c4yfilm.export(HERE, NAME, TITLE, [os.path.join(HERE, "thumb", "t1.png"), os.path.join(HERE, "thumb", "t2.png")], os.path.join(HERE, "thumb", "prompty-ai.txt"),
                   tg_send="--bez-tg" not in sys.argv)
