"""Voice-over for a motion ad: ONE ElevenLabs call (consistent tone) with character timestamps, split into lines
and words.  voice.mp3 + alignment.json are cached next to the ad; delete them to regenerate (costs credits).

lines.json: [{"text", "start", "end", "words": [{"w", "s", "e"}]}] in seconds of voice.mp3.
"""
import base64, json, os, re, sys

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(ROOT, "app", "vendor"), os.path.join(ROOT, "app")]
import dubbing as D  # noqa: E402

# GŁOS MARKI Leady48h (decyzja użytkownika 2026-11-11): zaprojektowany od zera „projekt P2”, motion/c4y/glos_marki/glos_marki.json.
# Adam (B9cNwbQXN3s6l3nU6fqz) ZAKAZANY 2026-11-11 („tragedia”), jest w zakazane_glosy (tools/kontrola/montaz_progi.json).
VOICE = "s5sTcgy9qKwgPPyiFwVJ"
MODEL = "eleven_v3"
SEP = "\n\n"


def _tts_with_timestamps(text, voice, model):
    eleven = D.ElevenLabs(D.secrets().get("elevenlabs_api_key"))
    payload = {"text": text, "model_id": model, "voice_settings": {"stability": .5, "similarity_boost": .75}}
    data, _ = eleven.request("POST", f"/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
                             json.dumps(payload).encode(), {"Content-Type": "application/json"}, timeout=240)
    d = json.loads(data)
    return base64.b64decode(d["audio_base64"]), d.get("alignment") or d.get("normalized_alignment")


def join(lines, seps=None):
    """TTS text: lines joined with SEP (a paragraph each); seps[i] = separator before line i (" " = the line continues
    the previous sentence, so the voice keeps one intonation while the plan can still split it, e.g. on a re-drop)"""
    return lines[0] + "".join((seps[i] if seps and seps[i] else SEP) + ln for i, ln in enumerate(lines) if i)


def generate(here, lines, voice=VOICE, model=MODEL, seps=None):
    mp3, al_path = os.path.join(here, "voice.mp3"), os.path.join(here, "alignment.json")
    text = join(lines, seps)
    if not (os.path.exists(mp3) and os.path.exists(al_path)):
        audio, al = _tts_with_timestamps(text, voice, model)
        with open(mp3, "wb") as f:
            f.write(audio)
        with open(al_path, "w", encoding="utf-8") as f:
            # voice_id zapisany przy rolce: kontrola montażu (tools/kontrola/montaz.py) sprawdza go z listą głosów z pół internetu
            json.dump({"text": text, "alignment": al, "voice_id": voice, "model": model}, f, ensure_ascii=False)
    al = json.load(open(al_path, encoding="utf-8"))["alignment"]
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    joined = "".join(chars)
    # locate each line inside the aligned character stream (it may differ from the input only in whitespace)
    out, pos = [], 0
    for ln in lines:
        core = ln.strip()
        i = joined.find(core, pos)
        if i < 0:  # fall back to a whitespace-insensitive search
            pat = r"\s*".join(map(re.escape, core.replace(" ", "")))
            m = re.compile(pat).search(joined, pos)
            i, j = (m.start(), m.end()) if m else (pos, pos + len(core))
        else:
            j = i + len(core)
        pos = j
        words, cur = [], None
        for k in range(i, j):
            ch = chars[k]
            if ch.isspace():
                if cur:
                    words.append(cur)
                    cur = None
                continue
            if cur is None:
                cur = {"w": "", "s": st[k], "e": en[k]}
            cur["w"] += ch
            cur["e"] = en[k]
        if cur:
            words.append(cur)
        speech = [w for w in words if re.search(r"\w", w["w"])]
        out.append({"text": ln, "start": round(speech[0]["s"], 3), "end": round(speech[-1]["e"], 3),
                    "words": [{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3)} for w in words]})
    with open(os.path.join(here, "lines.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    for l in out:
        print(f"{l['start']:6.2f} {l['end']:6.2f} ({l['end'] - l['start']:.2f}s)  {l['text']}")
    return out
