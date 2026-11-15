r"""Clips4you rolka nr 10 „Zatrzymałeś się” (kierunek i sceny użytkownika 2026-10-10 noc, wiedza/clips4you-rolki-10-i-6.md).
Nasz koleś („założyciel” z reklam) w żółtym garniturze idzie przejściem w tłumie, kamera jedzie tyłem; na „Zatrzymałeś się”
tłum zamiera, on kuca; pstryk = cięcie do kawiarni przy tej samej ulicy: „Ta była o nas. Następna może być o Twojej firmie.”
Głos z wideo (H3 Max), ten sam opis głosu w obu klipach. Budżet ok. 5 zł: 3 kadry + 2 klipy 768P, bez 1080P, bez RIFE.
  ..\..\..\runtime\python.exe script.py wycena | kadry --zgoda X | arkusz | ruch 768P --zgoda X ; montaż: montaz.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import kino

FACE = r"plik:..\postac\A\still.png"   # „założyciel” z reklam Clips4you (opłacony wcześniej)
MAN = ("the same man as in the reference image: identical face, short dark brown hair, brown eyes, short stubble beard, about 33 "
       "years old, wearing a perfectly tailored signal-yellow two-piece suit over a black fine-knit turtleneck, black leather shoes")
LOOK = ("Hyper-realistic cinematic film still, 35mm anamorphic lens, natural skin texture, subtle film grain, rich contrast, crisp "
        "late-afternoon sunlight. The yellow suit is the strongest color in the frame. Vertical 9:16 frame. No text, no captions, "
        "no logos, no watermark.")
VOICE = ("He speaks natural, fluent Polish with a confident, energetic, warm male voice of a man about 35, with a slight smile in "
         "the voice, lips moving in perfect sync")

PLAN = dict(
    name="r10", look=LOOK,
    frames=[
        dict(id="face", src=FACE),
        dict(id="k2", refs=["face"], prompt=(
            f"{MAN}. He crouches down low in the middle of a wide zebra crossing in central Warsaw, close to the camera, forearms resting "
            "on his knees, looking straight into the lens with a confident knowing half-smile, lips closed. Camera at his eye level, low, "
            "medium close-up, his face sharp and clearly recognizable. Behind him a dense big-city crowd is frozen in mid-step like a "
            "paused video: legs mid-stride, a coat hem in mid-air, many people looking down at their glowing phones, all completely still. "
            "Black asphalt with bold white stripes, the Palace of Culture and Science softly out of focus in the background.")),
        dict(id="k1", refs=["k2", "face"], prompt=(
            f"{MAN}. Wide shot: he walks confidently straight toward the camera across a wide zebra crossing in central Warsaw, in the "
            "middle of a dense, hurried big-city crowd crossing in both directions like in New York, many people looking at their "
            "phones. Black asphalt with bold white stripes, the Palace of Culture and Science in the background. He looks into the lens, "
            "full body, he is the only person in color, everyone else in muted grey, beige and black clothes.")),
        dict(id="k3", refs=["k2", "face"], prompt=(
            f"{MAN}. Medium shot: he sits relaxed at a small round white marble table on the terrace of an elegant sidewalk café on the "
            "same Warsaw street, legs crossed, a small white espresso cup in his hand, looking calmly into the lens with a faint smile. "
            "The street behind him is calm now, only a few passersby, the zebra crossing visible softly out of focus. Warm calm light.")),
    ],
    clips=[
        dict(id="c1", first="k1", last="k2", secs=7, prompt=(
            "One continuous Steadicam shot, the camera tracks backward in front of him at walking pace. He walks confidently toward the "
            "camera through the hurrying crowd on the zebra crossing and immediately says in Polish: \"Zatrzymałeś się na tej rolce.\" "
            "On the word \"Zatrzymałeś\" the entire crowd around him freezes completely in mid-step like a paused video, only he keeps "
            "moving. He stops and crouches down close to the camera, the camera lowers smoothly to his eye level, and he says: "
            "\"Twoi klienci zatrzymują się dokładnie tak samo.\" " + VOICE + ". Sound: busy city street, footsteps and traffic that "
            "cut to sudden silence the moment the crowd freezes. No music. No text, no logos.")),
        dict(id="c2", first="k3", secs=5, prompt=(
            "Slow gentle push-in toward him. He takes a small sip of espresso, puts the cup down on the saucer, looks into the lens and "
            "says calmly in Polish: \"Ta była o nas.\" Short pause, a confident smile, then: \"Następna może być o Twojej firmie.\" "
            + VOICE + ", calmer and more relaxed now. Sound: quiet café ambience, a cup clinking softly, a calm distant street. "
            "No music. No text, no logos.")),
    ],
)

if __name__ == "__main__":
    kino.main(HERE, PLAN)
