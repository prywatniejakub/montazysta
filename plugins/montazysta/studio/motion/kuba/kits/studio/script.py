r"""Marketplace kit video — YOUTUBE GAMING STUDIO (the WEFMI Studio app as a sellable SaaS kit), 16:9, ~1:45.
SaaS product-film look (Zelios / Lovio style): dark navy + violet glow, glass UI panels, typed text, smooth camera,
no bottom captions.  Narrator: Eric (smooth, trustworthy).  Page: studio.html, build: ../../lib/longkit.py.
  ..\..\..\..\runtime\python.exe script.py voice timing   /   script.py audio   /   script.py stills   /   script.py render mux
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import longkit

NAME = "studio"
ERIC = "cjVigY5qzO86Huf0OWal"  # Eric - Smooth, Trustworthy (premade)
CHAPTERS = [
    ("hook", "Hook", [
        ("h1", "You love making gaming videos."),
        ("h2", "But one video eats your whole weekend. Recording. Cutting. Captions. Shorts. Uploading."),
        ("h3", "Most channels don't die because they're bad. They die because the creator burns out."),
    ]),
    ("meet", "Meet the studio", [
        ("m1", "Meet YouTube Gaming Studio."),
        ("m2", "One app that records your game, edits it with AI, and runs your channel for you."),
    ]),
    ("record", "Record", [
        ("c1", "Press F10, and just play. It captures your game and your voice. Nothing else."),
        ("c2", "Need a break? F9 pauses. You still get one clean file."),
        ("c3", "Something epic happens? One key marks it. Funny. Scary. Short."),
    ]),
    ("edit", "Edit", [
        ("e1", "When you stop, it opens straight in the editor."),
        ("e2", "It speeds up the silence, writes your captions, and adds the sound effects and zooms."),
        ("e3", "Want the whole world to watch? It dubs your voice into English."),
        ("s1", "And every moment you marked becomes a vertical short. Captioned. Ready."),
    ]),
    ("publish", "Publish", [
        ("p1", "Then it fills your YouTube queue. One video and five shorts a day, scheduled weeks ahead."),
        ("p2", "Your computer can be off. YouTube posts them for you."),
        ("p3", "A weekend of work now fits into one evening."),
    ]),
    ("biz", "The business", [
        ("b1", "And here's the thing. This isn't just a tool. It's a business."),
        ("b2", "Run your own channels with it, or sell it to gaming creators for a monthly subscription."),
        ("k1", "The kit gives you everything. The app. The know-how. The marketing. And step by step videos."),
        ("k2", "Built with Claude. Ready for you to launch."),
        ("x1", "YouTube Gaming Studio. Unlock it on Kuba Builds AI."),
    ]),
]
GAPS = {"h2": .5, "h3": .7, "@meet": 1.2, "m2": .5, "@record": 1.0, "c2": .8, "c3": .8, "@edit": 1.0, "e2": .6, "e3": .8,
        "s1": 1.0, "@publish": 1.0, "p2": .6, "p3": .9, "@biz": 1.2, "b2": .5, "k1": .9, "k2": .6, "x1": 1.2}

if __name__ == "__main__":
    steps = sys.argv[1:] or ["voice", "timing"]
    if "voice" in steps:
        longkit.voice(HERE, CHAPTERS, voice_id=ERIC)
        steps = [s for s in steps if s != "voice"]
    if "audio" in steps:  # the music swell (~17.7 s) lands on "Meet" (18.07): pad the track by 0.35 s
        mus = os.path.join(HERE, "_music.wav")
        longkit.AK.run(["-i", os.path.join(longkit.kit.ASSETS, "music", "saas.mp3"), "-af", "adelay=350:all=1,aresample=48000", "-c:a", "pcm_s16le", mus])
        longkit.audio(HERE, NAME, longkit.page_sfx(HERE, NAME), music=mus, bed=-24.0)
        steps = [s for s in steps if s != "audio"]
    if steps:
        longkit.run(HERE, NAME, CHAPTERS, GAPS, steps)
