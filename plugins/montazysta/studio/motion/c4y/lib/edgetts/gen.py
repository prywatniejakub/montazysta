"""Darmowy lektor Microsoft Edge w Pythonie (odpowiednik gen.mjs, bez Node), dla paczki stylów na Macu.
  python gen.py <out_dir> <voice> <rate> <json lines [[key,text],...]>
Zapisuje <key>.mp3 i <key>.json ({text, voice, rate, words: [{w, s, e}]}); linie już zrobione (ten sam tekst, głos, tempo) pomija.
"""
import asyncio, json, os, sys, time

import edge_tts


async def one(out, key, text, voice, rate):
    com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for chunk in com.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            s = chunk["offset"] / 1e7
            words.append({"w": chunk["text"], "s": s, "e": s + chunk["duration"] / 1e7})
    if not audio or not words:
        raise RuntimeError("pusta odpowiedź")
    open(os.path.join(out, key + ".mp3"), "wb").write(bytes(audio))
    json.dump({"text": text, "voice": voice, "rate": rate, "words": words},
              open(os.path.join(out, key + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(key, len(words), "words", " ".join(w["w"] for w in words))


def main():
    out, voice, rate, lines_file = sys.argv[1:5]
    os.makedirs(out, exist_ok=True)
    for key, text in json.load(open(lines_file, encoding="utf-8")):
        jp = os.path.join(out, key + ".json")
        if os.path.exists(jp) and os.path.exists(os.path.join(out, key + ".mp3")):
            j = json.load(open(jp, encoding="utf-8"))
            if j.get("text") == text and j.get("voice", voice) == voice and j.get("rate", rate) == rate:
                print(key, "(gotowe)")
                continue
        for attempt in range(7):
            try:
                asyncio.run(one(out, key, text, voice, rate))
                break
            except Exception as e:  # 429/403 z serwera Edge: ponowienie z odczekaniem
                if attempt >= 6:
                    raise
                wait = 4 * (attempt + 1)
                print(key, "ponowienie za", wait, "s:", str(e)[:80])
                time.sleep(wait)
        time.sleep(1.2)


if __name__ == "__main__":
    main()
