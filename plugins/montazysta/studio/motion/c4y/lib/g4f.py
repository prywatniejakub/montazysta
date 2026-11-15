r"""Go4Driver PAKIET 3 (2026-10-25): 5 rolek DLA FIRM (zachęta do dodania oferty), WIELOJĘZYCZNE.
Uwagi klienta (2026-10-20): bez nazw i logo innych portali; obraz bez kraju i języka (bez polskich nazw, tablic, napisów),
żeby podmienić lektora. Dlatego: lektor z offu, ujęcia AI bez mówienia (zero ust), grafiki kodem z tekstem z LANG,
napisy z głosu (lib/g4f.js). Nowy język = LANG[<język>] + voice timing page audio render, ujęcia zostają.
Scenariusze: reklamy/go4driver-firmy-p3/scenariusze.md. Notatka: wiedza/project-go4driver-klient.md
  ..\..\runtime\python.exe c4y\lib\g4f.py lib <A1,A2|all> img anim frames      (wspólna biblioteka ujęć, płatne: img 0,15 $, anim)
  ..\..\runtime\python.exe c4y\lib\g4f.py <go4d18|...|all> [--lang pl] voice timing page stills audio render send
Kroki płatne pomijają się, gdy plik już jest. Komendy z img/anim/voice wymagają ZGODA=<kwota> (hook straznik-wydatkow).
"""
import json, os, shutil, subprocess, sys
LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
import c4ykit  # noqa: E402
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))
from g4d import MICHAL, MAGDA, ffprobe_dur  # noqa: E402

C4Y = c4ykit.C4Y
SHOTDIR = os.path.join(C4Y, "g4f_lib")
END = 1.3          # plansza końcowa po ostatnim słowie (dłużej = muzyka wraca uderzeniem po przerwie, recenzent 2026-10-25)
DELAY = 0.06       # głos startuje prawie od razu (klatka 0 pełna: obraz + napis + głos)
MUSIC = os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_groove.mp3")
MUSIC_CALM = os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_calm.mp3")
IMG_MODEL = "fal-ai/nano-banana-pro"                                  # 0,15 $ / zdjęcie
ANIM_MODEL = "fal-ai/kling-video/v2.5-turbo/pro/image-to-video"      # 0,07 $/s, 5 s = 0,35 $

# wspólne w każdym zdjęciu: Europa bez kraju (uwaga klienta), zero tekstu i tablic, realizm
NEUTRAL = ("Photorealistic vertical 9:16 photo, natural light, real-world documentary look, shot on a full-frame camera, shallow depth "
           "of field. European setting that could be any EU country: European cab-over trucks (no American long-nose trucks), "
           "no brand logos, no text anywhere, no license plates visible (plates out of frame or turned away), no signs, no flags, "
           "no writing on clothes or vehicles, no watermark.")

# biblioteka ujęć (A..): prompt zdjęcia + prompt ruchu (bez mówienia, usta zamknięte albo niewidoczne);
# ref = to samo ujęcie postaci co w innym zdjęciu (nano-banana-pro/edit z tym zdjęciem jako wzorem twarzy i ubrania)
OWNER = ("a 55-year-old European man, owner of a small trucking company, short gray hair, gray stubble, weathered face, "
         "navy fleece jacket over a checked shirt")
SHOTS = {
    "A1": dict(img="Inside the cab of a modern European truck at dawn: the empty driver's seat seen from the passenger side, a set of "
                   "keys lying on the dashboard, first orange light through the windscreen, dust in the air, a quiet company yard outside.",
               move="Very slow push-in towards the empty driver's seat, dust particles drifting in the sunlight, nothing else moves."),
    "A2": dict(img="A single white European semi-truck parked alone on a large empty gravel company yard at dawn, seen from the side, "
                   "light fog, wet ground, a few empty parking lines, cold blue light with a warm sunrise on the horizon.",
               move="Slow lateral drone-like camera move along the parked truck, fog drifting slowly, the truck stays still."),
    "A3": dict(img=f"Close-up of {OWNER} sitting at a cluttered desk in a small transport company office, a window behind him shows "
                   "trucks in the yard, he looks down at his phone, tired and worried, one hand on his forehead, mouth closed.",
               move="He slowly lowers the phone and exhales, looking out of the window; subtle handheld camera; mouth stays closed, he does not speak."),
    "A4": dict(img="A 40-year-old European woman, transport dispatcher, seen from behind over her shoulder, holding a phone to her ear, "
                   "standing at an office window that looks out on a truck yard, a wall planner and a key board on the wall, her face not visible.",
               move="She shifts her weight and lowers the phone with a sigh, still seen from behind; slow push-in; no talking visible."),
    "A5": dict(img="Close-up of a wall key board in a trucking company office: rows of hooks with truck keys and colored tags without "
                   "writing, one set of keys hangs alone in sharp focus, the other hooks around it empty, soft morning light.",
               move="Slow rack focus and push-in to the single hanging key set, it sways very gently."),
    "A6": dict(img="A European truck driver around 35, seen from behind, walking across a company yard towards a parked semi-truck in "
                   "the early morning, a duffel bag on his shoulder, work jacket without logos, long morning shadows.",
               move="Camera follows him from behind at walking pace, steady gimbal shot, he keeps walking towards the truck."),
    "A7": dict(img="Aerial drone photo of a single European semi-truck driving on a wide motorway through green countryside at sunset, "
                   "golden light, long shadow, high angle from far above so no details are readable.",
               move="Smooth drone tracking shot following the truck from above, the truck drives forward, sun flare."),
    "A8": dict(img="Close-up from inside a truck cab: the driver's hands on the steering wheel, a sunny European motorway ahead through "
                   "the windscreen, dashboard without any brand marks, slight motion blur on the road.",
               move="The hands make a small steering correction, the road flows towards the camera, light vibration of the cab."),
    "A9a": dict(img="A white refrigerated semi-trailer backed up to a loading dock at a logistics warehouse in the evening, a forklift "
                    "nearby, warm dock lights, seen from a low three-quarter rear angle, no writing on the trailer.",
                move="Slow push-in towards the loading dock, the dock light flickers softly, the forklift waits."),
    "A9b": dict(img="A polished stainless-steel tanker semi-truck parked at an industrial site under a clear sky, seen from the side, "
                    "reflections on the tank, no writing or hazard labels.",
                move="Slow orbit around the tanker, reflections slide over the steel surface."),
    "A9c": dict(img="A tipper truck at a gravel pit, the box raised, gravel sliding out, dust in golden afternoon light, seen from the side.",
                move="Gravel pours out of the raised box, dust rises, slow camera push-in."),
    "A10": dict(img=f"On a sunny truck yard, {OWNER} shakes hands with a new younger driver (about 30) and hands him a set of truck keys, "
                    "both seen in profile, smiling with closed mouths, a parked semi-truck behind them.", ref="A3",
                move="The handshake finishes and the keys pass into the driver's hand, both nod, slight handheld camera; no talking."),
    "A11": dict(img="A European truck driver around 40 sitting in the cab at a highway rest stop in the evening, scrolling on his phone, "
                    "the screen is not visible to the camera, a small relaxed smile with closed mouth, warm cab light.",
                move="He scrolls with his thumb and his smile grows a little, he nods to himself; slow push-in; no talking."),
    "A12": dict(img=f"At night on an empty truck yard lit by a single lamp, {OWNER}, now wearing a high-visibility vest over the jacket, "
                    "climbs alone into the cab of a semi-truck, seen from behind and slightly from the side.", ref="A3",
                move="He pulls himself up into the cab and closes the door, the cab light turns on; slow handheld camera."),
}

# rolki: tytuł do klienta (bez dopisków), głos, styl, ujęcia i grafiki (kotwice w g4f.js: "b2", "b2+.5", "b2@3", "b2>", "~-.1");
# kotwice w ułamkach linii, żeby działały też w innym języku (słowo @N tylko tam, gdzie liczba słów się nie zmieni)
def C(sid, ai=False, **o):
    return dict(kind="clip", clip="g4f_" + sid, ai=ai, **o)


# WERSJA ZA DARMO (decyzja użytkownika 2026-10-25): B-roll z Pexels (licencja darmowa komercyjna), wycinek ss..ss+dur;
# pliki: zsz/stock/<id>.mp4 (pobiera zsz/pexv.py get <id>). Prawdziwe nagrania = bez znaczka AI. Ciężarówki tylko w detalach
# i z drona (na stockach przeważają amerykańskie auta, tablice i logo, a klient nie chce elementów pod kraj).
STOCK = os.path.join(C4Y, "zsz", "stock")


def P(pid, ss=0.0, dur=8.0, **o):
    return dict(kind="clip", clip=f"pex_{pid}_{int(ss * 10)}", src=[pid, ss, dur], ai=False, **o)


REELS = {
    # 01 koszt postoju (struktura S13): ciężarówka stoi -> portal tylko dla transportu -> ogłoszenie opisuje prawdziwą pracę -> CTA
    "go4d18": dict(title="Dla firm: ciężarówka stoi", voice=MICHAL, tempo=1.08, bgsrc=[38502680, 2.0, 8],
        layers={"a2": P(38060571, 1.0, 7, z=[1.02, 1.12]), "a3": P(8347687, 1.0, 6), "a5": P(6182057, 0.5, 7, z=[1.0, 1.12]),
                "a1": P(35689447, 1.0, 7, z=[1.0, 1.1]),
                "logo": dict(kind="kin", tx="logo", times=["b4", "b4+.35"]),
                "card": dict(kind="card", times=["b5~-.15"], hi=[[2, "b5+.42"], [3, "b5+.58"], [4, "b5+.72"], [6, "b5+.86"]]),
                "a11": P(6170792, 4.0, 7), "a6": P(35210505, 3.0, 8, z=[1.0, 1.06])},
        shots=[["b1", "a2", {}], ["b2", "a3", {"from": 1}], ["b2+.5", "a5", {"fade": 1}], ["b3", "a1", {"from": -1}],
               ["b4~-.1", "logo", {"from": 1}], ["b5~-.15", "card", {"from": -1}], ["b6~-.1", "a11", {"from": 1}], ["b7~-.1", "a6", {"from": -1}]],
        end="b7+.42"),
    # 02 start portalu (S01, 10XLaw 236 dni): wołanie + zaproszenie -> startuje -> dlaczego teraz -> jedno z pierwszych -> kilka minut -> CTA
    "go4d19": dict(title="Dla firm: zaproszenie na start", voice=MAGDA, tempo=1.08, bgsrc=[38502680, 2.0, 8],
        layers={"a1": P(6182057, 2.0, 6, z=[1.04, 1.14]), "a6": P(38502680, 3.0, 7, z=[1.0, 1.08]),
                "logo": dict(kind="kin", tx="logo", times=["b2", "b2+.3", "b2+.78"]),
                "why": dict(kind="kin", tx="why", times=["b3", "b3+.55"]),
                "a11": P(6170792, 1.0, 8),
                "first": dict(kind="kin", tx="first", times=["b4+.55", "b4+.86"]),
                "steps": dict(kind="steps", times=["b5+.5", "b5+.72", "b5+.9"])},
        shots=[["b1", "a1", {}], ["b1+.33", "a6", {"from": 1}], ["b2~-.1", "logo", {"from": -1}], ["b3~-.1", "why", {"from": 1}],
               ["b4~-.1", "a11", {"from": -1}], ["b4+.52", "first", {"from": 1}], ["b5~-.1", "steps", {"from": -1}]],
        end="b6"),
    # 03 cisza w słuchawce (S09, Pomoc Powypadkowa 588 dni): scena dyspozytora -> wróg = ogólnikowe ogłoszenie -> 3 rzeczy -> ogłoszenie z konkretami
    "go4d20": dict(title="Dla firm: cisza w słuchawce", voice=MAGDA, tempo=1.1, bgsrc=[38502680, 2.0, 8],
        layers={"a4": P(7224510, 2.0, 8, z=[1.0, 1.08]), "a1": P(8344229, 3.0, 6, z=[1.1, 1.18]),
                "cmp": dict(kind="compare", times=["b2~-.1", "b4+.15"]),
                "a11": P(6170792, 1.0, 8, z=[1.02, 1.1]),
                "card": dict(kind="card", times=["b5~-.5"], step=.04, hi=[[3, "b5"], [5, "b5+.42"], [6, "b5+.78"]]),
                "a4b": P(7686677, 0.5, 7, z=[1.0, 1.06])},
        shots=[["b1", "a4", {}], ["b1+.8", "a1", {"fade": 1}], ["b2~-.1", "cmp", {"from": 1}], ["b3~-.1", "a11", {}],
               ["b4~-.1", "cmp", {"from": 1}], ["b5~-.3", "card", {}], ["b6~-.1", "a4b", {}]],
        end="b7"),
    # 04 flota i filtr (S12): chłodnia, cysterna, wywrotka -> „kierowca C+E. I tyle.” -> jak ma Cię znaleźć -> filtr -> Twoja oferta
    "go4d21": dict(title="Dla firm: chłodnia, cysterna, wywrotka", voice=MICHAL, tempo=1.08, bgsrc=[38502680, 2.0, 8],
        layers={"a9a": P(38060571, 0.5, 6, z=[1.02, 1.1]), "a9b": P(33459364, 1.0, 5, z=[1.02, 1.1]), "a9c": P(34295393, 2.0, 6, z=[1.02, 1.1]),
                "vague": dict(kind="compare", tx="vague", times=["b2~-.1"]),
                "a11": P(6170792, 6.0, 7),
                "fil": dict(kind="filters", times=["b4+.5", "b4+.68", "b4+.88"])},
        shots=[["b1", "a9a", {}], ["b1@1~-.05", "a9b", {}], ["b1@2~-.05", "a9c", {}], ["b2~-.1", "vague", {"from": 1}],
               ["b3~-.1", "a11", {"from": -1}], ["b4~-.1", "fil", {"from": 1}]],
        end="b6"),
    # 05 sam za kierownicą (S04, Iles): zachowanie właściciela -> biuro w dzień, trasa w nocy -> 3 kroki -> kluczyki nowemu kierowcy
    "go4d22": dict(title="Dla firm: sam za kierownicą", voice=MICHAL, calm=True, tempo=1.08, bgsrc=[38502680, 2.0, 8],
        layers={"a12": P(7564887, 2.0, 7, z=[1.0, 1.08]), "a8": P(5520046, 1.0, 7), "a3": P(8347684, 1.0, 6), "a7": P(35689447, 3.0, 6, z=[1.0, 1.06]),
                "three": dict(kind="kin", tx="three", times=["b3"]),
                "steps": dict(kind="steps", times=["b4+.05", "b4+.55", "b4+.78"]),
                "a10": P(7424469, 1.0, 6, z=[1.0, 1.06])},
        shots=[["b1", "a12", {}], ["b1+.55", "a8", {"from": 1}], ["b2~-.1", "a3", {"from": -1}], ["b2+.45", "a7", {"fade": 1}],
               ["b3~-.1", "three", {"from": 1}], ["b4~-.1", "steps", {"from": -1}], ["b4+.8", "a10", {"from": 1}]],
        end="b5"),
}

# tekst każdej rolki w danym języku: linie lektora, słowa na limonkowo, teksty grafik (tx), opis pod rolkę.
# Nowy język: skopiuj "pl" -> "de", przetłumacz, ustaw voice (głos w tym języku), kroki voice timing page audio render.
CARD_PL = {"ex": "PRZYKŁADOWA OFERTA", "job": "Kierowca C+E", "where": "Trasy krajowe · obsada jednoosobowa",
           "tags": ["Chłodnia", "System 5/2", "Weekend w domu", "C+E, kod 95"], "pay": "8 000 - 10 000 zł netto"}
END_PL = {"bar": "DLA FIRM TRANSPORTOWYCH", "endSub": "Portal pracy tylko dla transportu", "endCta": "Dodaj ofertę za darmo",
          "logo": {"rows": ["Go<b>4</b>Driver", "<small>Portal pracy tylko dla transportu</small>"]}}
TAGS = "#firmatransportowa #transport #szukamkierowcy #kierowcaCE #rekrutacja #spedycja #go4driver"
LANG = {"pl": {
    "go4d18": dict(lines=[("b1", "Ciężarówka stoi. Rata leci, ubezpieczenie też."),
                          ("b2", "Ogłoszenie wisi, a kierowców nie ma."),
                          ("b3", "Zaraz powiem, co z tym zrobić."),
                          ("b4", "Go For Driver. Portal pracy tylko dla transportu."),
                          ("b5", "Opisujesz pracę, jak jest: naczepa, system, zjazdy, stawka."),
                          ("b6", "Kierowca od razu wie, czy to dla niego."),
                          ("b7", "Wejdź na Go For Driver i dodaj ofertę za darmo. Ciężarówka nie poczeka.")],
                   keys=["stoi", "rata", "ubezpieczenie", "kierowców", "transportu", "naczepa", "system", "zjazdy", "stawka", "darmo"],
                   tx=dict(END_PL, card=CARD_PL),
                   opis="Ciężarówka stoi, rata leci, a kierowcy nie ma? 🚛\nGo4Driver to portal pracy tylko dla transportu. Opisujesz pracę tak, jak wygląda: naczepa, system, zjazdy do domu, stawka.\nDodaj ofertę za darmo 👉 link w bio\n\n" + TAGS),
    "go4d19": dict(lines=[("b1", "Kierowców brakuje? Firmy transportowe, mamy zaproszenie."),
                          ("b2", "Go For Driver, portal pracy tylko dla transportu, właśnie startuje."),
                          ("b3", "Dlaczego warto wejść teraz?"),
                          ("b4", "Bo ogłoszenie dodane teraz kierowcy zobaczą jako jedno z pierwszych. Nie jedno z setek."),
                          ("b5", "Dodajesz je w kilka minut: konto firmy, oferta, gotowe."),
                          ("b6", "Wejdź na Go For Driver i dodaj ofertę za darmo.")],
                   keys=["brakuje", "zaproszenie", "startuje", "teraz", "pierwszych", "minut", "darmo"],
                   tx=dict(END_PL, logo={"rows": ["Go<b>4</b>Driver", "<small>Portal pracy tylko dla transportu</small>", "<b>Startuje</b>"]},
                           why={"rows": ["Dlaczego", "<b>teraz?</b>"]},
                           first={"rows": ["Jedno z <b>pierwszych</b>", "<small>nie jedno z setek</small>"]},
                           steps={"title": "Kilka minut", "items": ["Konto firmy", "Oferta", "Gotowe"]}),
                   opis="Kierowców brakuje? Firmy transportowe, mamy zaproszenie 📩\nGo4Driver, portal pracy tylko dla transportu, właśnie startuje. Ogłoszenie dodane teraz kierowcy zobaczą jako jedno z pierwszych.\nDodaj ofertę za darmo 👉 link w bio\n\n" + TAGS),
    "go4d20": dict(lines=[("b1", "Dzwoni kandydat. Pytasz o prawo jazdy. Cisza."),
                          ("b2", "W ogłoszeniu było: atrakcyjne wynagrodzenie, zadzwoń."),
                          ("b3", "A kierowca chce wiedzieć trzy rzeczy, zanim zadzwoni."),
                          ("b4", "Na Go For Driver wpisujesz je w ogłoszeniu od razu."),
                          ("b5", "System pracy. Uprawnienia. Stawka."),
                          ("b6", "Rozmowa zaczyna się od konkretów."),
                          ("b7", "Wejdź na Go For Driver i dodaj ofertę, póki jest za darmo.")],
                   keys=["cisza", "atrakcyjne", "trzy", "wpisujesz", "system", "uprawnienia", "stawka", "konkretów", "darmo"],
                   tx=dict(END_PL, card=CARD_PL,
                           cmp={"vague": {"title": "Kierowca poszukiwany", "rows": ["Atrakcyjne wynagrodzenie.", "Zadzwoń!"]}, "card": CARD_PL}),
                   opis="Dzwoni kandydat, pytasz o prawo jazdy i… cisza 📵\nKierowca chce znać system pracy, uprawnienia i stawkę, zanim zadzwoni. Na Go4Driver wpisujesz je w ogłoszeniu od razu.\nDodaj ofertę, póki jest za darmo 👉 link w bio\n\n" + TAGS),
    "go4d21": dict(lines=[("b1", "Chłodnia. Cysterna. Wywrotka."),
                          ("b2", "A w ogłoszeniu tylko: kierowca C plus E. I tyle."),
                          ("b3", "Jak kierowca od chłodni ma Cię znaleźć?"),
                          ("b4", "Na Go For Driver zaznacza filtr: naczepa, system pracy, marka."),
                          ("b5", "I od razu widzi Twoją ofertę z chłodnią."),
                          ("b6", "Wejdź na Go For Driver i dodaj ofertę za darmo.")],
                   keys=["chłodnia", "cysterna", "wywrotka", "tyle", "znaleźć", "filtr", "naczepa", "marka", "twoją", "darmo"],
                   tx=dict(END_PL, vague={"vague": {"title": "Kierowca C+E", "rows": []}},
                           fil={"label": "Filtry kierowcy", "chips": ["Naczepa: chłodnia", "System 3/1", "Marka: Volvo"],
                                "yours": "Twoja oferta", "yoursSub": "Chłodnia · 3/1 · Volvo"}),
                   opis="Chłodnia, cysterna, wywrotka. A w ogłoszeniu tylko „kierowca C+E”? 🤔\nNa Go4Driver kierowca zaznacza filtr: naczepa, system pracy, marka. I od razu widzi Twoją ofertę.\nDodaj ofertę za darmo 👉 link w bio\n\n" + TAGS),
    "go4d22": dict(lines=[("b1", "Jeśli sam jedziesz trasę za brakującego kierowcę, zostań."),
                          ("b2", "W dzień biuro, w nocy trasa. Etat marzeń."),
                          ("b3", "Trzy kroki, żeby to skończyć."),
                          ("b4", "Rejestrujesz firmę na Go For Driver. Dodajesz ofertę. Zatrudniasz kierowcę."),
                          ("b5", "Wejdź na Go For Driver i dodaj ofertę za darmo. Zanim następna trasa wypadnie na Ciebie.")],
                   keys=["sam", "trasę", "biuro", "nocy", "marzeń", "trzy", "kroki", "darmo"],
                   tx=dict(END_PL, three={"rows": ["<b>3</b> kroki"]},
                           steps={"title": "Ogłoszenie w kilka minut", "items": ["Zarejestruj firmę", "Dodaj ofertę", "Zatrudnij kierowcę"]}),
                   opis="Sam jedziesz trasę za brakującego kierowcę? W dzień biuro, w nocy trasa 🌙\nTrzy kroki: zarejestruj firmę na Go4Driver, dodaj ofertę, zatrudnij kierowcę.\nDodaj ofertę za darmo 👉 link w bio\n\n" + TAGS),
}}


def d(name, lang="pl", *p):
    return os.path.join(C4Y, name if lang == "pl" else f"{name}-{lang}", *p)


def _manifest(clip, n):
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8")); man[clip] = n
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")


# ---- biblioteka ujęć (wspólna dla wszystkich rolek i języków)
def lib_img(sid):
    import falkit, urllib.request
    os.makedirs(SHOTDIR, exist_ok=True)
    out = os.path.join(SHOTDIR, sid + ".png")
    if os.path.exists(out):
        print("img: jest", sid); return
    S = SHOTS[sid]
    arg = {"prompt": S["img"] + " " + NEUTRAL, "num_images": 1, "aspect_ratio": "9:16", "resolution": "2K", "output_format": "png"}
    if S.get("ref"):  # ta sama postać: zdjęcie wzorcowe jako odniesienie twarzy i ubrania
        arg["prompt"] = "Keep exactly the same man (face, hair, stubble, clothes) as in the reference photo. New scene: " + arg["prompt"]
        res = falkit.run(IMG_MODEL + "/edit", dict(arg, image_urls=[falkit.host(os.path.join(SHOTDIR, S["ref"] + ".png"))]))
    else:
        res = falkit.run(IMG_MODEL, arg)
    urllib.request.urlretrieve(res["images"][0]["url"], out)
    print("zdjęcie:", out)


def lib_anim(sid):
    import falkit
    src, out = os.path.join(SHOTDIR, sid + ".png"), os.path.join(SHOTDIR, sid + ".mp4")
    if os.path.exists(out):
        print("anim: jest", sid); return
    falkit.run(ANIM_MODEL, {"image_url": falkit.host(src), "prompt": SHOTS[sid]["move"], "duration": "5",
                            "negative_prompt": "talking, lip movement, speaking, text, subtitles, logo, license plate, watermark, "
                                               "blur, distort, morphing, extra fingers, low quality"}, out)


def lib_frames(sid):
    clip = "g4f_" + sid
    out = os.path.join(c4ykit.CLIPS, clip); shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    c4ykit.run(["-i", os.path.join(SHOTDIR, sid + ".mp4"), "-an", "-vf",
                "fps=30,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920", "-q:v", "3",
                os.path.join(out, "%03d.jpg")])
    n = len(os.listdir(out)); _manifest(clip, n)
    print(clip, n, "klatek")


def bgclip(R):
    """tło grafik: rozmyty B-roll (mała rozdzielczość wystarczy, i tak jest rozmyty)"""
    return f"pexbg_{R['bgsrc'][0]}_{int(R['bgsrc'][1] * 10)}" if R.get("bgsrc") else None


def stock(name, lang):
    """klatki B-rolli rolki (0 zł): wycinek ss..ss+dur z zsz/stock/<id>.mp4 -> clips/pex_<id>_<ss>"""
    R = REELS[name]
    if R.get("bgsrc"):
        pid, ss, dur = R["bgsrc"]; out = os.path.join(c4ykit.CLIPS, bgclip(R))
        if not (os.path.isdir(out) and os.listdir(out)):
            os.makedirs(out, exist_ok=True)
            c4ykit.run(["-ss", f"{ss}", "-t", f"{dur}", "-i", os.path.join(STOCK, f"{pid}.mp4"), "-an", "-vf",
                        "fps=30,scale=270:480:force_original_aspect_ratio=increase,crop=270:480", "-q:v", "4", os.path.join(out, "%03d.jpg")])
            _manifest(bgclip(R), len(os.listdir(out)))
    for L in R["layers"].values():
        if not L.get("src"):
            continue
        pid, ss, dur = L["src"]
        out = os.path.join(c4ykit.CLIPS, L["clip"])
        if os.path.isdir(out) and os.listdir(out):
            continue
        os.makedirs(out, exist_ok=True)
        c4ykit.run(["-ss", f"{ss}", "-t", f"{dur}", "-i", os.path.join(STOCK, f"{pid}.mp4"), "-an", "-vf",
                    "fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", "-q:v", "3",
                    os.path.join(out, "%03d.jpg")])
        _manifest(L["clip"], len(os.listdir(out)))
        print(L["clip"], len(os.listdir(out)), "klatek")


# ---- rolka
def voice(name, lang):
    R, X = REELS[name], LANG[lang][name]
    vo = d(name, lang, "vo", "reel"); os.makedirs(vo, exist_ok=True)
    c4ykit.kit.tighten(vo, [t for _, t in X["lines"]], voice_id=X.get("voice") or R["voice"])
    open(d(name, lang, "opis.txt"), "w", encoding="utf-8").write(X["opis"] + "\n")


def vfile(name, lang):
    """głos do miksu: przyspieszony (R["tempo"], atempo bez zmiany wysokości) albo zwykły"""
    f = d(name, lang, "vo", "reel", "voice_f.mp3")
    return f if REELS[name].get("tempo") and os.path.exists(f) else d(name, lang, "vo", "reel", "voice_t.mp3")


def timing(name, lang):
    X, tempo = LANG[lang][name], REELS[name].get("tempo") or 1.0
    L = json.load(open(d(name, lang, "vo", "reel", "lines.json"), encoding="utf-8"))
    if tempo != 1.0:  # lektor szybciej o tyle, czasy słów dzielone przez tempo
        c4ykit.run(["-i", d(name, lang, "vo", "reel", "voice_t.mp3"), "-af", f"atempo={tempo}", "-q:a", "2", d(name, lang, "vo", "reel", "voice_f.mp3")])
        for l in L:
            l["start"] /= tempo; l["end"] /= tempo
            for w in l["words"]: w["s"] /= tempo; w["e"] /= tempo
    T = {"DUR": round(L[-1]["end"] + DELAY + END, 2), "VEND": 99, "DELAY": DELAY, "lines": []}
    for (k, _), l in zip(X["lines"], L):
        T["lines"].append({"key": k, "text": l["text"], "slot": round(l["start"] + DELAY, 3),
                           "words": [{"w": w["w"], "t": round(w["s"] + DELAY, 3), "e": round(w["e"] + DELAY, 3)} for w in l["words"]]})
    json.dump(T, open(d(name, lang, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(d(name, lang, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print(f"{name} [{lang}]: DUR {T['DUR']} s")


def page(name, lang):
    R, X = REELS[name], LANG[lang][name]
    cfg = {k: R[k] for k in ("layers", "shots", "calm", "sfx", "capn") if k in R}
    cfg.update(hook=X.get("hook"), bg=bgclip(R), bar=X["tx"].get("bar"), keys=X.get("keys", []), tx=X["tx"], end={"at": R["end"]})
    open(d(name, lang, "reel.js"), "w", encoding="utf-8").write("window.REEL = " + json.dumps(cfg, ensure_ascii=False, indent=1) + ";\n")
    html = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{name} [{lang}] · {R['title']} (Go4Driver, pakiet 3)</title>
<link rel="stylesheet" href="../lib/c4y.css">
<link rel="stylesheet" href="../lib/g4d.css">
<link rel="stylesheet" href="../lib/g4s.css">
<link rel="stylesheet" href="../lib/g4f.css">
</head>
<body>
<script src="../clips/manifest.js"></script>
<script src="timing.js"></script>
<script src="reel.js"></script>
<script src="../lib/c4y.js"></script>
<script src="../lib/g4s.js"></script>
<script src="../lib/g4f.js"></script>
<script>G4F.build(); boot("{os.path.basename(d(name, lang))}.m4a");</script>
</body>
</html>
"""
    open(d(name, lang, os.path.basename(d(name, lang)) + ".html"), "w", encoding="utf-8").write(html)
    print("strona:", d(name, lang))


def stills(name, lang):
    T = json.load(open(d(name, lang, "timing.json"), encoding="utf-8"))
    c4ykit.stills(d(name, lang), os.path.basename(d(name, lang)), [round(x * .5, 2) for x in range(int(T["DUR"] * 2) + 1)])


def audio(name, lang):
    import mixkit
    R, T = REELS[name], json.load(open(d(name, lang, "timing.json"), encoding="utf-8"))
    calm = R.get("calm")
    mixkit.mix(d(name, lang), os.path.basename(d(name, lang)), T["DUR"], MUSIC_CALM if calm else MUSIC,
               tracks=[(vfile(name, lang), T["DELAY"], 0, 0.0, None)], bed=-20.0 if calm else -17.0)


def render(name, lang):
    # kilka rolek naraz: G4F_WORKERS=3 na rolkę, żeby nie zadławić procesora
    c4ykit.render(d(name, lang), os.path.basename(d(name, lang)), workers=int(os.environ.get("G4F_WORKERS", 6)))


def send(name, lang):
    base = os.path.basename(d(name, lang))
    subprocess.run([c4ykit.PY, os.path.join(c4ykit.ROOT, "tools", "realizacje", "realizacje.py"), "wyslij", "go4driver",
                    d(name, lang, base + ".mp4"), "--tytul", LANG[lang][name].get("title") or REELS[name]["title"],
                    "--opis", d(name, lang, "opis.txt")], check=True)


STEPS = {"stock": stock, "voice": voice, "timing": timing, "page": page, "stills": stills, "audio": audio, "render": render, "send": send}
LIBSTEPS = {"img": lib_img, "anim": lib_anim, "frames": lib_frames}

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    lang = "pl"
    if "--lang" in args:
        i = args.index("--lang"); lang = args[i + 1]; del args[i:i + 2]
    if args[0] == "lib":
        ids = list(SHOTS) if args[1] == "all" else args[1].split(",")
        for s in args[2:]:
            for sid in ids:
                print(f"== {sid}: {s}", flush=True); LIBSTEPS[s](sid)
    else:
        names = list(REELS) if args[0] == "all" else args[0].split(",")
        for n in names:
            os.makedirs(d(n, lang), exist_ok=True)
            for s in args[1:]:
                print(f"== {n} [{lang}]: {s}", flush=True); STEPS[s](n, lang)
