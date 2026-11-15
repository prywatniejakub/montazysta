r"""HeyGen Avatar IV: a photo + our own voice file (the ElevenLabs "Reel" line) -> a lip-synced 9:16 clip for a reel hook.
One voice through the whole reel (the user's rule). Key: app secrets "heygen_api_key" (dubbing.secrets()).
  runtime/python.exe motion/kuba/lib/heygen.py <photo.png> <audio.mp3> <out.mp4> ["motion prompt"] [720p|1080p]
API v3 (2026-09): POST /v3/assets (multipart "file") -> asset_id; POST /v3/videos {type: image, image: {type: asset_id},
audio_asset_id, aspect_ratio 9:16, resolution, motion_prompt, expressiveness, engine: {type: avatar_iv}}; GET /v3/videos/<id>.
"""
import json, os, sys, time, uuid, urllib.request
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(ROOT, "app", "vendor"), os.path.join(ROOT, "app")]
import dubbing as D  # noqa: E402

API = "https://api.heygen.com"


def _key():
    return D.secrets()["heygen_api_key"]


def _req(method, path, body=None, headers=None):
    h = {"x-api-key": _key(), "accept": "application/json", **(headers or {})}
    if isinstance(body, (dict, list)):
        body, h["Content-Type"] = json.dumps(body).encode(), "application/json"
    r = urllib.request.Request(API + path, data=body, method=method, headers=h)
    try:
        return json.load(urllib.request.urlopen(r, timeout=120))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path}: {e.code} {e.read()[:500]}")


def upload(path):
    b = uuid.uuid4().hex
    ct = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4"}[os.path.splitext(path)[1].lower()]
    data = (f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{os.path.basename(path)}\"\r\nContent-Type: {ct}\r\n\r\n").encode() \
        + open(path, "rb").read() + f"\r\n--{b}--\r\n".encode()
    d = _req("POST", "/v3/assets", data, {"Content-Type": f"multipart/form-data; boundary={b}"})["data"]
    print("asset", d.get("asset_id"), d.get("mime_type"))
    return d["asset_id"]


def make(photo, audio, out, motion="", res="720p", expr="high"):
    body = {"type": "image", "image": {"type": "asset_id", "asset_id": upload(photo)}, "audio_asset_id": upload(audio),
            "aspect_ratio": "9:16", "resolution": res, "expressiveness": expr, "title": os.path.basename(out)}
    if motion:
        body["motion_prompt"] = motion
    vid = _req("POST", "/v3/videos", body, {"Idempotency-Key": uuid.uuid4().hex})["data"]["video_id"]
    print("video", vid)
    for _ in range(180):
        time.sleep(10)
        d = _req("GET", f"/v3/videos/{vid}")["data"]
        st = d.get("status")
        print(" ", st)
        if st in ("completed", "success"):
            urllib.request.urlretrieve(d["video_url"], out)
            print("saved", out, d.get("duration"))
            return out
        if st in ("failed", "error"):
            raise RuntimeError(json.dumps(d)[:800])
    raise TimeoutError(vid)


def lipsync(video, audio, out, mode="precision"):
    """real footage + our voice file -> the same footage with the mouth re-animated to the new audio (/v3/lipsyncs)"""
    body = {"video": {"type": "asset_id", "asset_id": upload(video)}, "audio": {"type": "asset_id", "asset_id": upload(audio)},
            "mode": mode, "title": os.path.basename(out), "keep_the_same_format": True}
    lid = _req("POST", "/v3/lipsyncs", body, {"Idempotency-Key": uuid.uuid4().hex})["data"]["lipsync_id"]
    print("lipsync", lid)
    for _ in range(240):
        time.sleep(10)
        d = _req("GET", f"/v3/lipsyncs/{lid}")["data"]
        st = d.get("status")
        print(" ", st)
        if st in ("completed", "success"):
            urllib.request.urlretrieve(d.get("video_url") or d.get("url"), out)
            print("saved", out)
            return out
        if st in ("failed", "error"):
            raise RuntimeError(json.dumps(d)[:800])
    raise TimeoutError(lid)


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "lipsync":  # heygen.py lipsync <video.mp4> <audio.mp3> <out.mp4> [precision|speed]
        lipsync(a[1], a[2], a[3], a[4] if len(a) > 4 else "precision")
        sys.exit()
    make(a[0], a[1], a[2], a[3] if len(a) > 3 else "", a[4] if len(a) > 4 else "720p")
