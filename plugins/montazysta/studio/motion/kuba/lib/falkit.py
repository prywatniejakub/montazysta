r"""fal.ai queue client (key: app secrets "fal_key"). Used for AI edits of Kuba's real footage, e.g. a new background
that keeps him, the banana mic and his motion (Kling O1 video edit), before HeyGen lip-sync.
  runtime\python.exe motion\kuba\lib\falkit.py bg <video.mp4> "<new background>" <out.mp4>
Source files are hosted through HeyGen assets (public URL), so nothing else is needed.
"""
import json, os, sys, time, urllib.request
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.dirname(os.path.abspath(__file__)), os.path.join(ROOT, "app", "vendor"), os.path.join(ROOT, "app")]
import dubbing as D  # noqa: E402

EDIT = "fal-ai/kling-video/o1/video-to-video/edit"  # 3-10 s input, ~$0.168/s
KEEP = ("Keep the man exactly the same: his face, cap, glasses, beard, black t-shirt, hands, the banana with the pink "
        "microphone on top, the camera framing and every movement. Photorealistic, natural light matching the new place.")


def _req(method, url, body=None):
    h = {"Authorization": "Key " + D.secrets()["fal_key"], "Accept": "application/json"}
    data = None
    if body is not None:
        data, h["Content-Type"] = json.dumps(body).encode(), "application/json"
    try:
        return json.load(urllib.request.urlopen(urllib.request.Request(url, data=data, method=method, headers=h), timeout=120))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {url}: {e.code} {e.read()[:600]}")


def host(path):
    """public URL for a local file (HeyGen asset storage)"""
    import heygen, uuid
    b = uuid.uuid4().hex
    ct = {".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg"}[os.path.splitext(path)[1].lower()]
    data = (f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{os.path.basename(path)}\"\r\nContent-Type: {ct}\r\n\r\n").encode() \
        + open(path, "rb").read() + f"\r\n--{b}--\r\n".encode()
    return heygen._req("POST", "/v3/assets", data, {"Content-Type": f"multipart/form-data; boundary={b}"})["data"]["url"]


def _get(url, tries=20, wait=15):
    """GET with retries: fal sometimes answers 403 "User is locked" for a moment even with credits; the job is already paid"""
    for i in range(tries):
        try:
            return _req("GET", url)
        except Exception as e:
            if i == tries - 1:
                raise
            print("fal GET odbija, ponawiam:", str(e)[:120], flush=True)
            time.sleep(wait)


def run(model, args, out=None):
    sub = _req("POST", f"https://queue.fal.run/{model}", args)
    rid, st_url, res_url = sub["request_id"], sub.get("status_url"), sub.get("response_url")
    print(model, rid)
    for _ in range(240):
        time.sleep(6)
        st = _get(st_url)
        if st.get("status") == "COMPLETED":
            break
        if st.get("status") not in ("IN_QUEUE", "IN_PROGRESS"):
            raise RuntimeError(json.dumps(st)[:600])
    res = _get(res_url)
    if out:
        urllib.request.urlretrieve(res["video"]["url"], out)
        print("saved", out)
    return res


def bg(video, where, out):
    return run(EDIT, {"video_url": host(video), "prompt": f"Replace the background: he now sits {where}. " + KEEP, "keep_audio": False}, out)


LIPSYNC = "fal-ai/sync-lipsync/v2/pro"  # Sync Labs lipsync-2-pro: redraws the mouth to the new audio (HeyGen precision barely did)


def lipsync(video, audio, out, mode="cut_off"):
    return run(LIPSYNC, {"video_url": host(video), "audio_url": host(audio), "sync_mode": mode}, out)


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "lipsync":  # falkit.py lipsync <video.mp4> <audio.mp3> <out.mp4>
        lipsync(a[1], a[2], a[3])
    if a[0] == "bg":
        bg(a[1], a[2], a[3])
