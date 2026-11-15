r"""Podstrony próbek dla leadów 2026-10-05: clips4you.pl/p/<slug> (rolka + pobierz + 3 pakiety, linki płatności na clips4you.pl/zamow).
Wygląd = site/p/sixseven.html (nagłówek, CSS, sekcja pakietów). MP4 web (crf 23) + plakat. Dopisuje wpisy do site/p/probki.json.
  ..\..\..\runtime\python.exe strony.py schrony shift dobrekrzesla aquafilter
"""
import os, re, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(C4Y, "..", ".."))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
SITE = os.path.join(ROOT, "clips4you", "site", "p")

LEADS = {
    "schrony": dict(firma="Schrony", src="sch1/sch1.mp4", file="rolka-schrony.mp4", dl="Schrony - rolka probna.mp4", poster_t=0.6,
                    h1='3 rolki dla <span class="mk">Schronów</span> są gotowe.',
                    lead="Zrobiliśmy je z Waszego wirtualnego spaceru, bez nowego nagrywania.",
                    facts=["Hook od pierwszej sekundy: „To nie jest apartament. To schron.”",
                           "Kamera przechodzi przez Turtle House: schody, drzwi pancerne, salon, spiżarnia, filtrowentylacja.",
                           "Na końcu Wasze logo i bezpłatna wycena."],
                    more=[dict(src="sch2/sch2.mp4", file="rolka-schrony-syreny.mp4", dl="Schrony - syreny.mp4", tag="ROLKA 2", title="Gdy wyją syreny",
                               desc="„Wyją syreny. Masz dokąd zejść z rodziną?” Drzwi pancerne, filtrowentylacja, prąd awaryjny i licznik 72 h."),
                          dict(src="sch3/sch3.mp4", file="rolka-schrony-3-rzeczy.mp4", dl="Schrony - piwnica to nie schron.mp4", tag="ROLKA 3", title="Piwnica to nie schron",
                               desc="Lista 1-2-3: drzwi pancerne, ściany min. 40 cm betonu, filtrowentylacja. Na końcu bezpłatna wycena.")],
                    probka={"firma": "Schrony (e-schrony.pl)", "keys": ["schron", "schrony", "e-schrony", "e-schrony.pl", "eschrony", "eschrony.pl", "turtle house"]}),
    "shift": dict(firma="Shift", src="shf2/shf2.mp4", file="rolka-shift-instagram.mp4", dl="Shift - Wasz film w 30 s.mp4", poster_t=0.6, v=2,
                  h1='3 rolki dla <span class="mk">Shift</span> są gotowe.',
                  lead="Zrobiliśmy je z Waszych nagrań z Instagrama i strony, bez nowego nagrywania.",
                  facts=["Wasz film z Instagrama (1:45) skrócony do 32 s, głosem prowadzącej.",
                         "Hook: „Pieniądze nie leżą na ziemi? Leżą.”",
                         "Liczniki: 37-50 zł za godzinę i 400 zł za dniówkę."],
                  more=[dict(src="shf1/shf1.mp4", file="rolka-shift-warzywa.mp4", dl="Shift - kroisz warzywa.mp4", tag="ROLKA 2", title="Dla operatorów",
                             desc="Lektor, szybkie cięcia: „Firmy AI płacą za filmy, na których kroisz warzywa.”"),
                        dict(src="shf3/shf3.mp4", file="rolka-shift-dla-firm.mp4", dl="Shift - dla firm.mp4", tag="ROLKA 3", title="Dla właścicieli firm",
                             desc="„Masz warsztat, kuchnię albo magazyn?” Z Waszym kalkulatorem: 1 osoba = ok. 3650 zł miesięcznie.")],
                  probka={"firma": "Shift (joinshift.pl)", "keys": ["shift", "joinshift", "joinshift.ai", "joinshift.pl", "microagi"]}),
    "ekredytonline": dict(firma="Ekredytonline", src="ekr1/ekr1.mp4", file="rolka-ekredytonline-ugc.mp4", dl="Ekredytonline - reklama UGC.mp4", poster_t=0.6, v=1,
                          h1='3 rolki dla <span class="mk">Ekredytonline</span> są gotowe.',
                          lead="Bez nagrywania: postać AI, nagranie Waszej porównywarki na telefonie i aktualne premie z Waszej strony.",
                          facts=["Reklama UGC: postać AI mówi hook „Bank może Ci zapłacić 800 zł za samo założenie konta”.",
                                 "Prawdziwe karty ofert z ekredytonline.pl (Alior, mBank, Erste).",
                                 "Bez kosztów kredytu w treści, z dopiskiem o warunkach promocji."],
                          more=[dict(src="ekr2/ekr2.mp4", file="rolka-ekredytonline-ranking.mp4", dl="Ekredytonline - ranking premii.mp4", tag="ROLKA 2", title="Ranking premii za konto",
                                     desc="Odliczanie od 4. do 1. miejsca: 500, 700, 720 i 800 zł. Z kartami ofert z Waszej strony."),
                                dict(src="ekr3/ekr3.mp4", file="rolka-ekredytonline-firmy.mp4", dl="Ekredytonline - konto firmowe.mp4", tag="ROLKA 3", title="Dla zakładających firmę",
                                     desc="„Zakładasz firmę? Bank da Ci nawet 4500 zł.” Erste, Pekao, Credit Agricole.")],
                          probka={"firma": "Ekredytonline (ekredytonline.pl)", "keys": ["ekredytonline", "ekredytonline.pl", "ekredyty", "ekredyty.pl", "e-kredyty", "kredytonline"]}),
    "dobrekrzesla": dict(firma="Dobre Krzesła", src="dk1/dk1.mp4", file="rolka-dobrekrzesla.mp4", dl="Dobre Krzesla - rolka probna.mp4", poster_t=0.6, v=3,
                         lead="Na początku każdej mówi ta sama postać AI (UGC) w Waszych wnętrzach, potem Wasze filmy. Bez nowego nagrywania.",
                         h1='3 rolki dla <span class="mk">Dobrych Krzeseł</span> są gotowe.',
                         facts=["Hook: postać AI na bordowym hokerze w Waszym showroomie: „Zanim kupisz krzesła do jadalni, zobacz, gdzie się je szyje.”",
                                "Wasza produkcja: strugarka, szwalnia, tapicerowanie. Potem krzesła w jadalni.",
                                "Na końcu showroom w Kłobucku i raty 0%. Postać jest wygenerowana przez AI (przy publikacji oznaczamy „treść AI”)."],
                         more=[dict(src="dk2/dk2.mp4", file="rolka-dobrekrzesla-tulip.mp4", dl="Dobre Krzesla - fotel Tulip.mp4", tag="ROLKA 2", title="Fotel Tulip i Cleanaboo",
                                    desc="Postać AI w fotelu Tulip: „Rozlany sok na fotelu?” Krople nie wnikają w tkaninę. Cena 1 150 zł, raty 0%."),
                               dict(src="dk3/dk3.mp4", file="rolka-dobrekrzesla-westa.mp4", dl="Dobre Krzesla - krzeslo Westa.mp4", tag="ROLKA 3", title="Westa w prawdziwej jadalni",
                                    desc="Postać AI na krześle Westa: „Zobacz je w prawdziwej jadalni, nie w katalogu.” Potem Wasze ujęcia wnętrza.")],
                         probka={"firma": "Dobre Krzesła (dobrekrzesla.pl)", "keys": ["dobre krzesla", "dobrekrzesla", "dobrekrzesla.pl", "atos", "atosmeble", "klobuck"]}),
    "127ai": dict(firma="127AI", src="a127/a127.mp4", file="rolka-127ai.mp4", dl="127AI - rolka probna.mp4", poster_t=0.6, v=1,
                  lead="Zrobiliśmy ją z Waszej strony 127ai.pl i własnej grafiki, bez nagrywania.",
                  facts=["Hook dla właściciela firmy: „Wklejasz dane klientów do ChatGPT? Właśnie wyszły z Twojej firmy.”",
                         "Potem Wasze argumenty ze strony: AI na serwerze u klienta, działa offline, żaden bajt nie wychodzi z sieci.",
                         "Licznik: Panel AI odpowiada w 8 sekund. Na końcu RODO, NIS2 i bezpłatna konsultacja."],
                  probka={"firma": "127AI (127ai.pl)", "keys": ["127ai", "127ai.pl", "127 ai", "127 ai.pl"]}),
    "aquafilter": dict(firma="Aquafilter", src="aq1/aq1.mp4", file="rolka-aquafilter.mp4", dl="Aquafilter - rolka probna.mp4", poster_t=0.6,
                       lead="Zrobiliśmy ją z Waszych filmów z YouTube, bez nowego nagrywania.",
                       facts=["Hook: „Wciąż dźwigasz zgrzewki wody z marketu?”",
                              "RO ELITE: 7 stopni filtracji, zbiornik 12 l, manometr do wymiany wkładów.",
                              "Dowód: Wasze stoisko z certyfikatem NSF na targach Big 5 w Dubaju."],
                       probka={"firma": "Aquafilter (aquafilter.com)", "keys": ["aquafilter", "aquafilter.com", "aqua filter", "filtry do wody"]}),
}

CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#111113" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def test_block(slug):
    """ZASADA 2026-10-05: na każdej stronie próbki pod pakietami miesiąc testowy (jednorazowo, bez abonamentu)"""
    return f"""  <section class="pk" id="test">
    <div class="wrap">
      <h2>Albo zacznij od <span class="mk">miesiąca testowego</span></h2>
      <p class="lead">Płacisz raz, bez abonamentu. Po 30 dniach sami decydujecie, czy zostajemy.</p>
      <div class="grid one">
        <div class="card rec">
          <span class="badge">BEZ ABONAMENTU</span>
          <h3>Miesiąc testowy</h3>
          <div class="who">Montaż rolek przez 30 dni, płatność jednorazowa.</div>
          <div class="price">1 490 zł <small>netto</small></div>
          <div class="gross">1 832,70 zł brutto · jednorazowo</div>
          <ul>
            <li>{CHECK}Bez limitu rolek</li>
            <li>{CHECK}Projekt za projektem, maks. 48 h</li>
            <li>{CHECK}Bez umowy i bez abonamentu</li>
          </ul>
          <a class="btn full" href="/miesiac-testowy?c={slug}">Zaczynam miesiąc testowy</a>
        </div>
      </div>
    </div>
  </section>

"""


TEST_CSS = ".grid.one { grid-template-columns: minmax(0, 420px); }\n"


def add_test(slug):
    """dopisuje blok miesiąca testowego do istniejącej strony (np. starsze szablony go4driver, sixseven)"""
    p = os.path.join(SITE, slug + ".html"); h = open(p, encoding="utf-8").read()
    if 'id="test"' in h: print(slug, "ma już miesiąc testowy"); return
    h = h.replace("</style>", TEST_CSS + "</style>", 1).replace("</main>", test_block(slug) + "</main>", 1)
    assert "—" not in h and "–" not in h
    open(p, "w", encoding="utf-8").write(h); print(slug, "+ miesiąc testowy")


def build(slug):
    L = LEADS[slug]
    tpl = open(os.path.join(SITE, "sixseven.html"), encoding="utf-8").read()
    head = tpl[:tpl.index("<body>")]
    for a, b in [("Próbka dla SIX SEVEN Street Food | Clips4you", f"Próbka dla {L['firma']} | Clips4you"),
                 ("Pierwsza rolka dla SIX SEVEN Street Food przygotowana przez Clips4you + pakiety współpracy.", f"Pierwsza rolka dla {L['firma']} przygotowana przez Clips4you."),
                 ("https://clips4you.pl/p/sixseven", f"https://clips4you.pl/p/{slug}"),
                 ("Pierwsza rolka dla SIX SEVEN Street Food. Zobacz i pobierz.", f"Pierwsza rolka dla {L['firma']}. Zobacz i pobierz.")]:
        assert a in head, a
        head = head.replace(a, b)
    head = head.replace(TEST_CSS, "")  # szablon sixseven ma już blok testowy (od 2026-10-05)
    end = tpl.index('  <section class="pk" id="test">') if 'id="test"' in tpl else tpl.index("</main>")
    pk = tpl[tpl.index('<section class="pk" id="pakiety">'):end]
    pk = re.sub(r'href="https://www\.kubabuildsai\.com/api/c4y/checkout\?c=sixseven&plan=(\w+)"', lambda m: f'href="/zamow?c={slug}&plan={m.group(1)}"', pk)
    assert "sixseven" not in pk and "kubabuildsai" not in pk
    pk = pk.replace("Chcecie ściągać więcej gości płatnymi kampaniami.", "Chcecie więcej klientów z płatnych kampanii.")
    pk = pk.replace("Najlepsze rolki puszczamy jako reklamy do ludzi z okolicy", "Najlepsze rolki puszczamy jako reklamy")
    foot = tpl[tpl.index("</main>"):]
    d = os.path.join(SITE, slug); os.makedirs(d, exist_ok=True)
    v = L.get("v", 1)

    def web(src_rel, file, poster):
        src = os.path.join(C4Y, src_rel)
        out = os.path.join(d, file)
        if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src) and os.path.exists(os.path.join(d, poster)):
            return  # plik web aktualny, bez ponownego kodowania
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", src, "-c:v", "libx264", "-crf", "23", "-preset", "slow", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", os.path.join(d, file)], check=True)
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", str(L["poster_t"]), "-i", src, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "3",
                        os.path.join(d, poster)], check=True)

    web(L["src"], L["file"], "poster.jpg")
    more = ""
    for i, m in enumerate(L.get("more", []), 1):
        web(m["src"], m["file"], f"poster-{i + 1}.jpg")
        more += f"""        <div class="vcard">
          <span class="tag">{m['tag']}</span>
          <video src="/p/{slug}/{m['file']}?v={v}" poster="/p/{slug}/poster-{i + 1}.jpg?v={v}" controls playsinline preload="none"></video>
          <h3>{m['title']}</h3>
          <p>{m['desc']}</p>
          <a class="btn w full" href="/p/{slug}/{m['file']}?v={v}" download="{m['dl']}">⬇ Pobierz (MP4)</a>
        </div>
"""
    if more:
        more = f"""  <section class="more" id="wiecej">
    <div class="wrap">
      <h2>Jeszcze <span class="mk">{len(L['more'])} rolki</span></h2>
      <div class="vgrid">
{more}      </div>
    </div>
  </section>

"""
    facts = "\n".join(f'        <li><b>{i}</b><span>{f}</span></li>' for i, f in enumerate(L["facts"], 1))
    body = f"""<body>
<header><div class="wrap">
  <a href="/" class="logo"><i><svg viewBox="0 0 100 100"><path fill="#ffd60a" d="M50 4C51.8 34 66 48.2 96 50C66 51.8 51.8 66 50 96C48.2 66 34 51.8 4 50C34 48.2 48.2 34 50 4Z"/></svg></i>Clips4you</a>
  <span class="for">dla {L['firma']}</span>
</div></header>

<main>
  <div class="wrap"><div class="done" id="paid">✅ Płatność przyjęta, dziękujemy! Dziś odezwiemy się z planem pierwszych rolek, a faktura VAT przyjdzie na podany e-mail. Kuba, Clips4you</div></div>
  <div class="wrap hero">
    <div>
      <h1>{L.get('h1') or f'Pierwsza rolka dla <span class="mk">{L["firma"]}</span> jest gotowa.'}</h1>
      <p class="lead">{L['lead']}</p>
      <ul class="facts">
{facts}
      </ul>
      <a class="btn w" href="/p/{slug}/{L['file']}?v={v}" download="{L['dl']}">⬇ Pobierz rolkę (MP4)</a>
      <p class="note">Format 9:16, gotowy na Instagram, TikTok, Facebook i YouTube Shorts.</p>
    </div>
    <div class="vbox">
      <video class="vid" src="/p/{slug}/{L['file']}?v={v}" poster="/p/{slug}/poster.jpg?v={v}" controls playsinline preload="metadata"></video>
    </div>
  </div>

{more}  {pk}{test_block(slug)}"""
    out = head.replace("</style>", TEST_CSS + "</style>", 1) + body + foot
    assert "—" not in out and "–" not in out
    open(os.path.join(SITE, slug + ".html"), "w", encoding="utf-8").write(out)
    # probki.json (CRM: przycisk Próbka)
    pj = os.path.join(SITE, "probki.json")
    lst = json.load(open(pj, encoding="utf-8"))
    url = f"https://clips4you.pl/p/{slug}"
    item = dict(firma=L["probka"]["firma"], url=url, keys=L["probka"]["keys"])
    lst = [item if x["url"] == url else x for x in lst] if any(x["url"] == url for x in lst) else lst + [item]  # bez zmiany kolejności
    open(pj, "w", encoding="utf-8").write("[\n" + ",\n".join("  " + json.dumps(x, ensure_ascii=False) for x in lst) + "\n]\n")
    print(slug, os.path.getsize(os.path.join(d, L["file"])) // 1024, "KB")


if __name__ == "__main__":
    for s in sys.argv[1:]:
        if s.startswith("+"): add_test(s[1:])   # +go4driver = tylko dopisz miesiąc testowy do istniejącej strony
        else: build(s)
