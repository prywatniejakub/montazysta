"""Send a finished reel to Kuba's phone via the Telegram bot @kubabuildsai_bot (config: .telegram.json next to this file).

    runtime\\python.exe motion\\kuba\\tg.py r17v                  -> rNv/rNv.mp4 + rNv/opis.txt
    runtime\\python.exe motion\\kuba\\tg.py <file.mp4> <opis.txt> [--title "..."]
    runtime\\python.exe motion\\kuba\\tg.py chat                  -> wait for /start and save chat_id
    runtime\\python.exe motion\\kuba\\tg.py tematy                -> one topic per channel in the bot chat (Threaded Mode on in @BotFather)
    --kanal main|stories|rankings|school|sociale|pomysly   -> send into that channel's topic (rNv reels default to sociale)

Message 1 = the video (sendVideo: bots upload the file as-is, no recompression, "Save to gallery" works on the phone).
Message 2 = the description in a <pre> block, so one tap copies the whole text.  Stdlib only (the runtime has no requests)."""
import html, json, mimetypes, os, sys, time, urllib.request, uuid
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CONF = os.path.join(HERE, ".telegram.json")
FFPROBE = os.path.join(HERE, "..", "..", "ffmpeg", "ffprobe.exe")
LIMIT = 50 * 1024 * 1024  # Bot API upload limit
# One topic per channel of the Kuba Builds AI network (wiedza/project-kanaly-porzadek.md); thread ids live in .telegram.json "topics".
TOPICS = {"main": "1 · Kuba Builds AI", "stories": "2 · Stories", "rankings": "3 · Rankings",
          "school": "4 · Free School", "sociale": "5 · Sociale (IG, TikTok)", "pomysly": "💡 Tytuły i pomysły", "prezentik": "🎁 Prezentik",
          "clipping": "✂️ Clipping"}
COLORS = [7322096, 16766590, 13338331, 9367192, 16749490, 16478047]  # the only icon colours Telegram accepts


def conf():
    return json.load(open(CONF, encoding="utf-8"))


def api(method, fields=None, files=None, timeout=60):
    url = f"https://api.telegram.org/bot{conf()['token']}/{method}"
    if files:
        bnd = uuid.uuid4().hex
        body = b""
        for k, v in (fields or {}).items():
            body += f'--{bnd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
        for k, path in files.items():
            ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
            body += (f'--{bnd}\r\nContent-Disposition: form-data; name="{k}"; filename="{os.path.basename(path)}"\r\n'
                     f"Content-Type: {ctype}\r\n\r\n").encode() + open(path, "rb").read() + b"\r\n"
        body += f"--{bnd}--\r\n".encode()
        req = urllib.request.Request(url, body, {"Content-Type": f"multipart/form-data; boundary={bnd}"})
    else:
        req = urllib.request.Request(url, json.dumps(fields or {}).encode(), {"Content-Type": "application/json"})
    try:
        res = json.load(urllib.request.urlopen(req, timeout=timeout))
    except urllib.error.HTTPError as e:
        res = json.load(e)
    if not res.get("ok"):
        raise SystemExit(f"Telegram {method}: {res.get('description')}")
    return res["result"]


def chat_id(wait=300):
    c = conf()
    if c.get("chat_id"):
        return c["chat_id"]
    print("Czekam, aż klikniesz Start u @kubabuildsai_bot ...", flush=True)
    end = time.time() + wait
    while time.time() < end:
        for u in api("getUpdates", {"timeout": 25}, timeout=40):
            m = u.get("message") or {}
            if m.get("chat", {}).get("type") == "private":
                c["chat_id"] = m["chat"]["id"]
                json.dump(c, open(CONF, "w", encoding="utf-8"))
                api("getUpdates", {"offset": u["update_id"] + 1})
                print("chat_id zapisany:", c["chat_id"])
                return c["chat_id"]
    raise SystemExit("Nie przyszło /start - kliknij Start u bota i uruchom ponownie.")


def group(kanal):
    """chat id of a separate group for this channel (.telegram.json "grupy"), or None"""
    return conf().get("grupy", {}).get(kanal) if kanal else None


def save_group(name, wait=600):
    """Kuba makes a group, adds @kubabuildsai_bot and writes anything there -> its chat id is saved under 'grupy'."""
    print(f"Czekam, aż dodasz @kubabuildsai_bot do grupy '{name}' i coś tam napiszesz ...", flush=True)
    end = time.time() + wait
    offset = None
    while time.time() < end:
        for u in api("getUpdates", {"timeout": 25, **({"offset": offset} if offset else {})}, timeout=40):
            offset = u["update_id"] + 1
            m = u.get("message") or u.get("my_chat_member") or u.get("channel_post") or {}
            chat = m.get("chat", {})
            if chat.get("type") in ("group", "supergroup"):
                c = conf()
                c.setdefault("grupy", {})[name] = chat["id"]
                json.dump(c, open(CONF, "w", encoding="utf-8"))
                api("getUpdates", {"offset": offset})
                print(f"Grupa '{chat.get('title')}' zapisana jako {name}: {chat['id']}")
                return chat["id"]
    raise SystemExit("Bot nie dostał nic z grupy - dodaj go do grupy i napisz tam cokolwiek, potem uruchom ponownie.")


def where(kanal):
    """Extra send fields for a channel: its topic thread, or {} (plain chat) when topics are not set up yet."""
    if not kanal or group(kanal):
        return {}
    if kanal not in TOPICS:
        raise SystemExit(f"Nieznany kanał '{kanal}'. Dostępne: {', '.join(TOPICS)}")
    tid = conf().get("topics", {}).get(kanal)
    return {"message_thread_id": tid} if tid else {}


def label(kanal):
    """Caption prefix when there is no topic to tell channels apart."""
    return f"[{TOPICS[kanal]}] " if kanal and not group(kanal) and not where(kanal) else ""


def topics():
    """Create the missing channel topics in the private chat with the bot (needs Threaded Mode on in @BotFather)."""
    c = conf()
    cid = chat_id()
    have = c.setdefault("topics", {})
    for i, (k, name) in enumerate(TOPICS.items()):
        if k in have or k in c.get("grupy", {}):
            continue
        t = api("createForumTopic", {"chat_id": cid, "name": name, "icon_color": COLORS[i % len(COLORS)]})
        have[k] = t["message_thread_id"]
        json.dump(c, open(CONF, "w", encoding="utf-8"))
        print("temat:", name, "->", have[k])
    print("Tematy gotowe:", ", ".join(TOPICS[k] for k in have))


def probe(path):
    try:
        out = subprocess.run([FFPROBE, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                              "-of", "json", path], capture_output=True, text=True).stdout
        j = json.loads(out)
        return j["streams"][0]["width"], j["streams"][0]["height"], round(float(j["format"]["duration"]))
    except Exception:
        return 1080, 1920, 0


def send(video, opis, title, kanal=None):
    if os.path.getsize(video) > LIMIT:
        raise SystemExit(f"{video} ma ponad 50 MB - limit bota. Zmniejsz CRF i wyrenderuj ponownie.")
    cid = group(kanal) or chat_id()
    text = open(opis, encoding="utf-8").read().strip() if opis and os.path.exists(opis) else ""  # "-" = the video only
    w, h, d = probe(video)
    print(f"Wysyłam {os.path.basename(video)} ({os.path.getsize(video) / 1e6:.1f} MB, {w}x{h}, {d} s) ...", flush=True)
    to = {"chat_id": cid, **where(kanal)}
    api("sendVideo", {**to, "caption": f"{label(kanal)}🎬 {title}", "width": w, "height": h, "duration": d, "supports_streaming": "true"},
        {"video": video}, timeout=600)
    if text:
        api("sendMessage", {**to, "parse_mode": "HTML", "text": f"<pre>{html.escape(text)}</pre>"})
    print("Wysłane: film" + (" + opis." if text else " (bez opisu)."))


if __name__ == "__main__":
    a = sys.argv[1:]
    title = kanal = None
    if "--title" in a:
        i = a.index("--title")
        title = a[i + 1]
        del a[i:i + 2]
    if "--kanal" in a:
        i = a.index("--kanal")
        kanal = a[i + 1]
        del a[i:i + 2]
    if a == ["chat"]:
        chat_id()
    elif len(a) == 2 and a[0] == "grupa":
        save_group(a[1])
    elif a == ["tematy"]:
        topics()
    elif len(a) == 1:  # reel folder name, e.g. r17v
        d = os.path.join(HERE, a[0])
        send(os.path.join(d, a[0] + ".mp4"), os.path.join(d, "opis.txt"), title or a[0], kanal or "sociale")
    elif len(a) == 2:
        send(a[0], a[1], title or os.path.splitext(os.path.basename(a[0]))[0], kanal)
    else:
        raise SystemExit(__doc__)
