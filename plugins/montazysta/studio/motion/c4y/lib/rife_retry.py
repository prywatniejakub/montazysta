"""Ponawia samo RIFE (fal) dla hooka reklamy, bez lokalnego fallbacku, aż przejdzie. Potem klatki hooka."""
import os, sys, time
sys.path.insert(0, ((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/motion/c4y/lib"))
import adkit, falkit

name = sys.argv[1]
ai = os.path.join(((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/motion/c4y"), name, "ai")
lip, l120 = os.path.join(ai, "lip.mp4"), os.path.join(ai, "lip120.mp4")
tmp = os.path.join(ai, "lip120_rife.mp4")
url = falkit.host(lip)
for i in range(1, 41):
    try:
        falkit.run("fal-ai/rife/video", {"video_url": url, "num_frames": 4, "use_scene_detection": False, "use_calculated_fps": True}, tmp)
        os.replace(tmp, l120)
        print(f"proba {i}: RIFE OK", flush=True)
        adkit.frames(name, l120)
        print("klatki hooka gotowe", flush=True)
        break
    except Exception as e:
        print(f"proba {i}: {str(e)[:120]}", flush=True)
        time.sleep(30)
else:
    print("RIFE nie przeszedl po 40 probach, zostaje wersja lokalna", flush=True)
