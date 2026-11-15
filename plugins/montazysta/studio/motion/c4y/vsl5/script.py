r"""Clips4you VSL 5: film uniwersalny przed rozmową (16:9): po co rolki, psychologiczny montaż, plan, dopasowanie, kto, rozmowa.
Styl: jasny SaaS jak Zelios (białe tło, żółte akcenty, telefony 3D, płynne przejścia).  Scenariusz: wiedza/clips4you-film-oferty-scenariusz.md
  ..\..\..\runtime\python.exe script.py freevoice timing      (darmowy lektor Windows „Adam”, bez kosztów)
  script.py voice timing                                     (ElevenLabs „Adam”: TYLKO po zgodzie użytkownika, ustaw ELEVEN_OK=1)
  script.py stills  /  script.py audio  /  script.py render mux
"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4yfilm  # noqa: E402

NAME = "vsl5"
# plan + paczka = te same zdania co v4 (głos z v4 skopiowany do vo/plan, vo/paczka: zero nowych znaków)
CHAPTERS = [
    ("hook", "Hook", [
        ("h1", "W dwie minuty pokażę Ci, dlaczego rolki jednych firm ogląda tysiąc osób, a innych trzy."),
        ("h2", "I jak sprawić, żeby Twoje były w tej pierwszej grupie."),
        ("h3", "Bez stawania przed kamerą i bez montowania po nocach.")]),
    ("skrot", "W skrócie", [
        ("q1", "W skrócie: robimy dla firm rolki, które ludzie oglądają do końca."),
        ("q2", "Co miesiąc dostajesz plan tematów z Twojej branży, gotowe rolki i godziny publikacji."),
        ("q3", "Ty tylko je wrzucasz.")]),
    ("dlaczego", "Dlaczego rolki", [
        ("d1", "Zanim klient do Ciebie zadzwoni, sprawdza Cię w internecie."),
        ("d2", "Jeśli widzi profil, na którym ostatni post był miesiąc temu, wybiera firmę, którą już zna z rolek."),
        ("d3", "A każda rolka zostaje na profilu i dalej buduje zaufanie.")]),
    ("mechanizm", "Psychologiczny montaż", [
        ("x1", "Tylko że większość rolek przegrywa w pierwszych trzech sekundach."),
        ("x2", "Ludzie przewijają dalej, a platforma przestaje je pokazywać."),
        ("x3", "Dlatego montujemy inaczej. To psychologiczny montaż rolek."),
        ("x4", "Na start pytanie, które zatrzymuje kciuk. Potem powód, żeby zostać. Obraz zmienia się co sekundę, dwie. A na końcu jedno wezwanie."),
        ("x5", "Ludzie oglądają do końca, więc platforma pokazuje rolkę kolejnym osobom.")]),
    ("plan", "Plan tematów", [
        ("k1", "Zaczynamy od planu."),
        ("k2", "Sprawdzamy, które tematy w Twojej branży już zebrały najwięcej wyświetleń, i rozpisujemy je na formaty, które niosą zasięgi."),
        ("k3", "Na przykład ranking: co jest na poziomie A, a co dopiero na B."),
        ("k4", "Plan na cały miesiąc akceptujesz, zanim powstanie pierwsza rolka. Bez Twojej zgody nic nie wychodzi.")]),
    ("dopas", "Rolki pod Twoją firmę", [
        ("f1", "Każda firma potrzebuje czegoś innego."),
        ("f2", "Rolki edukacyjne z ekspertem. Rolki z Twoimi ludźmi i realizacjami."),
        ("f3", "Albo postać dla Twojej marki, gdy nikt nie chce stanąć przed kamerą."),
        ("f4", "Na rozmowie dobierzemy, co pasuje do Ciebie.")]),
    ("paczka", "Paczka co tydzień", [
        ("w1", "Co tydzień na Telegramie dostajesz paczkę: gotowe rolki, opisy i godzinę publikacji na każdą platformę."),
        ("w2", "Wrzucasz o wskazanej porze i wracasz do pracy. Nie myślisz, co dziś wrzucić.")]),
    ("kto", "Kto za tym stoi", [
        ("b1", "Kto za tym stoi? Kuba, założyciel Clips for you. Od siedmiu lat robi marketing dla firm."),
        ("b2", "Wcześniej z zespołem prowadził marketing firmy z branży OZE."),
        ("b3", "Osiemnaście miesięcy, ponad siedemnaście tysięcy zgłoszeń i ponad piętnaście milionów złotych przychodu."),
        ("b4", "A konto twórczyni, które prowadzimy rolkami, w trzydzieści dni zebrało prawie dwa miliony wyświetleń.")]),
    ("gwar", "Gwarancja", [
        ("g1", "I jeszcze jedno. Jeśli w miesiącu nie dowieziemy piętnastu rolek, kolejny miesiąc robimy za darmo.")]),
    ("rozmowa", "Umów rozmowę", [
        ("c1", "Teraz kliknij przycisk pod tym filmem i wybierz termin, który Ci pasuje."),
        ("c2", "W pół godziny Kuba pokaże Ci plan rolek dla Twojej firmy: tematy, które w Twojej branży już działają."),
        ("c3", "Im szybciej zaczniemy, tym szybciej Twoje profile zapełnią się rolkami. Więc nie zwlekaj."),
        ("c4", "Kliknij przycisk poniżej i umów rozmowę.")]),
]
GAPS = {"@skrot": .5, "@dlaczego": .55, "@mechanizm": .55, "@plan": .6, "@dopas": .6, "@paczka": .55, "@kto": .6, "@gwar": .55,
        "@rozmowa": .55, "h2": .25, "h3": .3, "q3": .3, "x3": .35, "x5": .3, "b3": .3, "b4": .4, "c2": .3, "c4": .3}

PY = os.path.join(HERE, "..", "..", "..", "runtime", "python.exe")
FF = c4yfilm.FF


def freevoice(rate=1.08):
    """placeholder lector without credits: Windows OneCore Adam per line (word cues) -> vo/<chapter>/voice.mp3 + lines.json"""
    tmp = os.path.join(HERE, "vo_free")
    todo = [{"key": k, "text": tx} for _, _, ls in CHAPTERS for k, tx in ls]
    json.dump(todo, open(os.path.join(tmp + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
    subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", os.path.join(HERE, "tts_free.ps1"),
                    tmp + ".json", tmp, str(rate)], check=True)
    for cid, _, ls in CHAPTERS:
        d = os.path.join(HERE, "vo", cid)
        os.makedirs(d, exist_ok=True)
        out, parts, t = [], [], 0.0
        for k, tx in ls:
            wav = os.path.join(tmp, k + ".wav")
            dur = float(subprocess.run([os.path.join(os.path.dirname(FF), "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration",
                                        "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
            raw = open(os.path.join(tmp, k + ".json"), encoding="utf-8-sig").read().strip() or "[]"
            cues = json.loads(raw)
            cues = [cues] if isinstance(cues, dict) else cues
            # map cues to the script's own tokens by character position (keeps punctuation for captions)
            toks, pos = [], 0
            for w in tx.split(" "):
                i = tx.index(w, pos)
                toks.append([w, i, i + len(w), None])
                pos = i + len(w)
            for c in cues:
                for tk in toks:
                    if tk[1] <= c["pos"] < tk[2] and tk[3] is None:
                        tk[3] = c["start"]
                        break
            known = [(i, tk[3]) for i, tk in enumerate(toks) if tk[3] is not None]
            for i, tk in enumerate(toks):  # tokens without a cue: interpolate between neighbours
                if tk[3] is None:
                    a = max([q for q in known if q[0] < i], default=(0, 0.0))
                    b = min([q for q in known if q[0] > i], default=(len(toks), dur - .15))
                    tk[3] = a[1] + (b[1] - a[1]) * (i - a[0]) / max(1, b[0] - a[0])
            end = dur - .12  # OneCore leaves ~0.1-0.3 s of tail
            sil = subprocess.run([FF, "-hide_banner", "-i", wav, "-af", "silencedetect=n=-40dB:d=0.12", "-f", "null", "-"],
                                 capture_output=True, text=True).stderr
            import re
            st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", sil)]
            if st and st[-1] > toks[-1][3]:
                end = st[-1]
            words = []
            for i, tk in enumerate(toks):
                e = toks[i + 1][3] - .03 if i + 1 < len(toks) else end
                words.append({"w": tk[0], "s": round(t + tk[3], 3), "e": round(t + max(tk[3] + .08, e), 3)})
            out.append({"text": tx, "start": round(t + toks[0][3], 3), "end": round(t + end, 3), "words": words})
            parts.append(wav)
            t += dur
        lst = os.path.join(d, "_parts.txt")
        open(lst, "w", encoding="utf-8").write("".join(f"file '{p.replace(os.sep, '/')}'\n" for p in parts))
        subprocess.run([FF, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-ar", "44100", "-ac", "1",
                        "-b:a", "160k", os.path.join(d, "voice.mp3")], check=True)
        json.dump(out, open(os.path.join(d, "lines.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"== {cid}: {len(out)} lines, {t:.1f} s (darmowy lektor)")


def music():
    """positive bed (saas_leads.mp3, 122 BPM, quiet intro of 8 bars, beat drops at bar 8): intro, then bars k..45 so the drop lands
    on "Stała Obecność", then bars 36..45 looped until the film is covered, then 36..end; joins on bar lines with 10 ms fades"""
    src = os.path.join(HERE, "..", "..", "kuba", "assets", "music", "saas_leads.mp3")
    B, END = 4 * 60 / 122, 120.02
    T = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8"))
    tgt = next(w["t"] for l in T["lines"] if l["key"] == "d1" for w in l["words"] if w["w"].lower().startswith("zanim"))
    k = max(0, min(7, round(16 - tgt / B)))
    # only the steady parts: bars 8-25 and 33-57 (the breakdown at bar 26 and the loud peak at bars 28-32 are cut out:
    # user 2026-10-07 "muzyka pierdolnie po uszach" at ~1:15, that peak was 4 dB louder than the rest)
    segs = [(0, 8 * B), (k * B, 25 * B)]
    tot = 8 * B + (25 - k) * B
    while tot < T["DUR"] + 3:
        segs.append((33 * B, 57 * B)); tot += 24 * B
    fc = "".join(f"[0:a]atrim=start={a:.4f}" + (f":end={b:.4f}" if b else "") + f",asetpts=PTS-STARTPTS,afade=t=in:d=0.01" +
                 (f",afade=t=out:st={b - a - .01:.4f}:d=0.01" if b else "") + f"[s{i}];" for i, (a, b) in enumerate(segs))
    # even out the louder sections of the track (compressor) so the bed sits at one level under the voice
    fc += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1,aresample=48000,acompressor=threshold=0.1:ratio=3:attack=40:release=700:makeup=1,alimiter=limit=0.7:attack=5:release=120:level=disabled[o]"
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", src, "-filter_complex", fc, "-map", "[o]", "-c:a", "pcm_s16le", os.path.join(HERE, "_music.wav")], check=True)
    print(f"music: drop at {(16 - k) * B:.2f} s (target 'Stała' {tgt:.2f}), {len(segs)} segments")


def audio(bed=-23.5):
    """longkit.audio, but the music ducks under the voice (sidechain): the bed never covers the lector"""
    lk, AK = c4yfilm.longkit, c4yfilm.longkit.AK
    real = AK.run
    def run(args):
        if "-filter_complex" in args:
            i = args.index("-filter_complex"); f = args[i + 1]
            if f.startswith("[0:a]volume=") and "[1:a]volume=" in f and "[a][b]" in f:
                gv = f.split("[0:a]volume=")[1].split("dB")[0]; gm = f.split("[1:a]volume=")[1].split("dB")[0]
                f = f.replace(f"[0:a]volume={gv}dB[a];[1:a]volume={gm}dB[b];",
                              f"[0:a]volume={gv}dB,acompressor=threshold=0.18:ratio=3.5:attack=4:release=140:makeup=1,asplit=2[a][k];[1:a]volume={gm}dB[m];[m][k]sidechaincompress=threshold=0.08:ratio=2.5:attack=25:release=500:makeup=1[b];")
                args = args[:i + 1] + [f] + args[i + 2:]
                print("  (music ducks under the voice)")
        return real(args)
    AK.run = run
    try:
        lk.audio(HERE, NAME, lk.page_sfx(HERE, NAME), music=os.path.join(HERE, "_music.wav"), bed=bed)
    finally:
        AK.run = real


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "freevoice" in steps:
        freevoice()
        steps.remove("freevoice")
    if "voice" in steps and os.environ.get("ELEVEN_OK") != "1":
        raise SystemExit("ElevenLabs = wydatek: tylko po zgodzie użytkownika (ustaw ELEVEN_OK=1)")
    if "music" in steps:
        music()
        steps.remove("music")
    if "audio" in steps:
        if not os.path.exists(os.path.join(HERE, "_music.wav")):
            music()
        audio()
        steps.remove("audio")
    if steps:
        sys.argv = [sys.argv[0]] + steps
        c4yfilm.main(HERE, NAME, CHAPTERS, GAPS, music=os.path.join(HERE, "_music.wav"), bed=-23.5)
