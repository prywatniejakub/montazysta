r"""Clips4you rolka nr 15 „Podcast” (zgoda użytkownika 2026-10-11 „tak, 3,50”, wiedza/clips4you-r15-podcast.md).
AI podcast jak u Sartaina: prowadzący w słuchawkach pyta „Masz firmę. Co dało Ci tylu nowych klientów?”, nasz koleś w żółtym
garniturze odpowiada „Rolki. I nawet nie musiałem ich nagrywać.”; czarna karta CTA jak r10.
Przepis z r14: jedna osoba = jeden krótki klip z jedną kwestią prostymi słowami, każda kwestia w 2 ujęciach (dubel, a/b).
  ..\..\..\runtime\python.exe script.py wycena | kadry --zgoda X | arkusz | ruch 768P --zgoda X ; montaż: montaz.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import kino

MAN = ("the same man as in the reference images: identical face, short dark brown hair, brown eyes, short stubble beard, about 33 "
       "years old, wearing the same perfectly tailored signal-yellow two-piece suit over a black fine-knit turtleneck")
LOOK = ("Hyper-realistic frame that looks exactly like a real video podcast recorded with a cinema camera: 50mm lens, shallow depth "
        "of field, natural skin texture with pores, subtle film grain, rich contrast, true-to-life colors. Vertical 9:16 frame. "
        "No text, no captions, no readable letters on signs or books, no logos, no watermark.")
STUDIO = ("a cozy dark video podcast studio: dark brick wall behind, wooden shelves with books, plants and small decorations, warm "
          "practical lamps, a soft warm yellow accent light glowing in the background and a faint red rim light, the background softly "
          "out of focus")
SOUND = ("Sound: recorded on a close studio broadcast microphone in a quiet acoustically treated podcast room, warm, clear, dry voice, "
         "no echo, no background noise. No music. No text, no logos.")
HOST_V = ("He speaks natural, fluent Polish with a calm, curious, deep male voice of a podcast host about 40, lips moving in perfect sync")
GUEST_V = ("He speaks natural, fluent Polish with a confident, warm male voice of a man about 35, with a slight smile in the voice, "
           "lips moving in perfect sync")

HOST_LINE = "Masz firmę. Co dało Ci tylu nowych klientów?"
GUEST_LINE = "Rolki. I nawet nie musiałem ich nagrywać."

HOST_CLIP = ("Static podcast camera on a tripod, very subtle natural breathing movement. The host leans slightly toward his microphone, "
             f"looks at his guest just off camera and immediately says in Polish, clearly and naturally: \"{HOST_LINE}\" Then he "
             "stops talking and listens with a curious, slightly raised eyebrow and a small nod. " + HOST_V + ". " + SOUND)
GUEST_CLIP = ("Static podcast camera on a tripod, very subtle natural breathing movement. The man in the yellow suit sits relaxed at his "
              "microphone, looks at the host just off camera with a confident half-smile and immediately says in Polish, clearly and "
              f"naturally: \"{GUEST_LINE}\" Then he smiles and shrugs slightly. " + GUEST_V + ". " + SOUND)

PLAN = dict(
    name="r15", look=LOOK,
    frames=[
        dict(id="face", src=r"plik:..\postac\A\still.png"),
        dict(id="suit", src=r"plik:..\r10\k3.png"),
        dict(id="kh", prompt=(
            "Medium close-up of a video podcast host, framed from the chest up, his face large and sharp: a Polish man about 40, short "
            "dark blond hair, short trimmed beard, friendly intelligent eyes, wearing a plain black t-shirt and large black over-ear "
            "studio headphones. A black broadcast dynamic microphone on a boom arm is in front of him slightly to the side and below "
            "his chin, so his mouth is fully visible. He sits at a dark wooden podcast table, looking slightly off camera to the left "
            f"at his guest, mouth closed, attentive. Behind him {STUDIO}.")),
        dict(id="kg", refs=["suit", "face"], prompt=(   # bez kadru kh: 2 twarze w referencjach = filtr treści fal (2026-10-11)
            f"{MAN}. He is the guest of a video podcast, sitting at a dark wooden podcast table, "
            "wearing large black over-ear studio headphones. Medium close-up framed from the chest up, his face large and sharp, warm "
            "low-key studio lighting. A black broadcast dynamic microphone on a boom arm is in front "
            "of him slightly to the side and below his chin, so his mouth is fully visible. He looks slightly off camera to the right "
            f"at the host, relaxed and confident, mouth closed. Behind him {STUDIO}. The yellow suit is the strongest color in the "
            "frame.")),
    ],
    clips=[
        dict(id="ha", first="kh", secs=4, prompt=HOST_CLIP),
        dict(id="hb", first="kh", secs=4, prompt=HOST_CLIP),   # dubel: drugie ujęcie tej samej kwestii
        dict(id="ga", first="kg", secs=4, prompt=GUEST_CLIP),
        dict(id="gb", first="kg", secs=4, prompt=GUEST_CLIP),  # dubel
        # POPRAWKA 2026-10-11: w ha/hb „klientów” brzmi źle (użytkownik); nowa kwestia bez tego słowa, cała w jednym klipie (jeden głos)
        dict(id="hc", first="kh", secs=5, prompt=HOST_CLIP.replace(HOST_LINE, "Masz firmę. Co sprawiło, że telefon dzwoni non stop?")),
    ],
)

if __name__ == "__main__":
    kino.main(HERE, PLAN)
