r"""Clips4you rolka nr 14 „Sznurówka” (pomysł Claude zatwierdzony przez użytkownika 2026-10-11, wiedza/clips4you-rolki-10-i-6.md).
Nowy Świat latem: idzie na kamerę, kuca, wiąże żółtą sznurówkę: „Patrzysz, jak facet wiąże buta. I nie przewijasz.”, kamera w dół
na but; ukryte cięcie w bucie; ten sam but w śniegu, kamera w górę: zima, on dalej w samym garniturze, kawa z parą:
„Nudna scena, a obejrzałeś. Pomyśl, co zrobi rolka o Twojej firmie.” Formuła r10: głos z wideo, 768P, jedna próba, ok. 3,40 zł.
  ..\..\..\runtime\python.exe script.py wycena | kadry --zgoda X | arkusz | ruch 768P --zgoda X ; montaż: montaz.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import kino

MAN = ("the same man as in the reference images: identical face, short dark brown hair, brown eyes, short stubble beard, about 33 "
       "years old, wearing the same perfectly tailored signal-yellow two-piece suit over a black fine-knit turtleneck, black leather "
       "Oxford shoes with bright yellow shoelaces")
LOOK = ("Hyper-realistic photo that looks like a real candid frame filmed handheld in the street, 35mm lens, natural skin texture, "
        "subtle film grain, rich contrast, true-to-life colors. The yellow suit is the strongest color in the frame. Vertical 9:16 "
        "frame. No text, no captions, no shop signs with readable text, no logos, no watermark.")
VOICE = ("He speaks natural, fluent Polish with a confident, energetic, warm male voice of a man about 35, with a slight smile in "
         "the voice, lips moving in perfect sync")

PLAN = dict(
    name="r14", look=LOOK,
    frames=[
        dict(id="face", src=r"plik:..\postac\A\still.png"),
        dict(id="suit", src=r"plik:..\r10\k3.png"),
        dict(id="k1", refs=["suit", "face"], prompt=(
            f"{MAN}. Medium-wide shot at chest height: he walks confidently straight toward the camera along the wide sunny sidewalk of "
            "Nowy Świat street in Warsaw on a warm summer evening, golden-hour sunlight, elegant old tenement buildings with cafés, "
            "green trees, normal passersby in light summer clothes walking around him, a few looking at their phones. He looks into "
            "the lens with a relaxed half-smile, lips closed, full body visible, his face clearly recognizable.")),
        dict(id="k2", refs=["k1"], prompt=(
            "Close-up of the same man's right shoe from the previous image: he crouches on the grey granite sidewalk slabs of the same "
            "sunny street and both his hands are tying the bright yellow shoelace on his black leather Oxford shoe, the hem of his "
            "signal-yellow trousers and the yellow cuffs of his jacket visible. Camera high above the shoe looking down at about 60 "
            "degrees, the shoe fills the lower middle of the frame. Warm golden summer sunlight with long shadows, the feet of passersby "
            "in sneakers and sandals softly out of focus in the background, a fallen green leaf on the slabs.")),
        dict(id="k3", refs=["k2"], prompt=(
            "Exactly the same image with the same composition, the same camera angle, the same shoe, hands and yellow laces in the same "
            "position, but now it is deep winter: fresh white snow covers the sidewalk slabs and lies on the toe of the shoe, snowflakes "
            "falling, a few melting flakes on the yellow sleeves, cold blue-grey overcast daylight without sun, the feet of passersby in "
            "the background now wear heavy winter boots. A white paper coffee cup with a lid stands in the snow right next to the shoe, "
            "thin steam rising from it.")),
        dict(id="k4", refs=["k1", "face"], prompt=(
            f"{MAN}. Medium close-up at eye level, his face large and sharp: he stands on the same Nowy Świat sidewalk, but it is deep "
            "winter, heavy snow is falling, snow covers the street, the old tenement buildings and the bare trees. He wears only his "
            "yellow suit and black turtleneck, no coat, snowflakes on his shoulders and in his hair, completely calm and comfortable. "
            "He holds a white paper coffee cup with a lid at chest height, steam rising from it, and looks into the lens with a calm, "
            "amused half-smile, lips closed. Behind him, softly out of focus, passersby in thick winter coats, hats and scarves glance "
            "at him in disbelief. Cold blue-grey winter light, the yellow suit glowing against the snow.")),
        dict(id="k1b", src="klatka:c1_768P.mp4@5.60"),
        # TEST 2026-10-11 „ruch osobno, mowa osobno”: kwestie jako krótkie klipy od klatki gotowego wideo (0 zł)
        dict(id="k1s", src="klatka:c1_768P.mp4@3.20"),
        dict(id="k2s", src="klatka:c2_768P.mp4@1.75"),   # poprawka 2026-10-11: start z c1 tuż przed 2. kwestią (0 zł)
    ],
    clips=[
        dict(id="c1", first="k1", last="k2", secs=7, prompt=(
            "One continuous handheld shot, slightly shaky like filmed on a phone by a friend walking backward in front of him. He walks "
            "toward the camera along the sunny summer sidewalk, then suddenly stops, crouches down and starts tying the yellow "
            "shoelace on his right shoe; the camera crouches with him. While tying the lace he looks up into the lens with a playful "
            "smile and says in Polish: \"Patrzysz, jak facet wiąże buta. I nie przewijasz.\" Then he looks back down at his shoe and "
            "the camera tilts down onto the shoe and his hands tying the lace, ending in a close-up of the shoe. " + VOICE + ". "
            "Sound: summer city street, footsteps, distant tram bell, birds, light chatter. No music. No text, no logos.")),
        dict(id="c2", first="k3", last="k4", secs=6, prompt=(
            "One continuous handheld shot. It starts on the close-up of his shoe in fresh snow as his hands finish tying the yellow "
            "shoelace and pick up the steaming paper coffee cup from the snow. He stands up and the camera rises smoothly with him, "
            "revealing the same street now in deep winter with heavy snow falling and people in winter coats. He is still only in "
            "his yellow suit, completely calm. He looks into the lens and says in Polish: \"Nudna scena, a obejrzałeś. Pomyśl, co "
            "zrobi rolka o Twojej firmie.\" " + VOICE + ", calmer and amused now. Sound: muffled quiet winter street, snow crunching "
            "under shoes, soft wind. No music. No text, no logos.")),
        # POPRAWKA 2026-10-11: w c1 model powiedział „przewjasz”; nowa kwestia z łatwych słów, ten sam koniec na bucie (k2)
        dict(id="c1b", first="k1b", last="k2", secs=3, prompt=(
            "Continuous handheld shot, the camera at his eye level. He is crouched on the sunny summer sidewalk tying his yellow "
            "shoelace. He looks up into the lens with a playful smile and immediately says in Polish, clearly and naturally: "
            "\"I dalej tu jesteś.\" Then he looks back down at his shoe and the camera tilts down onto the shoe and his hands "
            "tying the lace, ending in a close-up of the shoe. " + VOICE + ". Sound: summer city street, footsteps, birds. "
            "No music. No text, no logos.")),
        dict(id="c1s", first="k1s", secs=3, prompt=(
            "Continuous handheld shot, the camera at his eye level. He is crouched on the sunny summer sidewalk, his hands on the "
            "yellow shoelace. He looks into the lens with a playful smile and immediately says in Polish, clearly and naturally: "
            "\"Patrzysz, jak facet poprawia buta.\" " + VOICE + ". Sound: summer city street, footsteps, birds. No music. No text, no logos.")),
        dict(id="c2s", first="k2s", secs=5, prompt=(
            "Continuous handheld shot, the camera at his eye level. He straightens up on the snowy winter sidewalk holding a paper "
            "coffee cup, snow falling, looks into the lens with a calm amused smile and immediately says in Polish, clearly and "
            "naturally: \"Nudna scena, a obejrzałeś. Pomyśl, co zrobi rolka o Twojej firmie.\" " + VOICE + ", calm and amused. "
            "Sound: quiet winter street, soft wind. No music. No text, no logos.")),
    ],
)

if __name__ == "__main__":
    kino.main(HERE, PLAN)
