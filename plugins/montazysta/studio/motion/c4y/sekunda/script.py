r"""Clips4you „SEKUNDA”: jedna pokazowa rolka na poziomie Artlist (pomysł Claude 2026-10-10, wiedza/clips4you-kino-hooki-bank.md).
Świat się przewija jak feed, jedna postać w żółtym (awatarka z kino2: twarz k3a) jest jedyną rzeczą, która się zatrzymuje.
7 ujęć po ok. 2-3 s, przejścia „przewinięcia” robione lokalnie, jeden głos ElevenLabs, muzyka, czerń z CTA.
  ..\..\..\runtime\python.exe script.py wycena | kadry --zgoda X | arkusz | ruch 768P --zgoda X
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import kino

FACE = r"plik:../kino2/k3a.png"    # wzorzec twarzy (opłacony w teście 2)
ROOM = r"plik:../kino2/k2.png"     # pokój PRL z nią na krześle (opłacony)
CHAR = ("the same woman as in the reference image: identical face, dark brown hair slicked back into a low bun, hazel-green eyes, "
        "light freckles, the same tiny iridescent pixel-sequin eye makeup in electric blue, turquoise and gold, the same canary-yellow "
        "tailored suit")
LOOK = ("Hyper-realistic cinematic film still, 35mm anamorphic lens, rich deep shadows, sharp detail, natural skin texture, subtle film "
        "grain, one saturated signal-yellow accent. Vertical 9:16 frame. No text, no captions, no logos, no watermark.")

PLAN = dict(
    name="sekunda", look=LOOK,
    frames=[
        dict(id="face", src=FACE), dict(id="room", src=ROOM),
        dict(id="s1", refs=["face"], prompt=(
            "Extreme macro close-up of one of her eyes from the reference image, filling the frame: the iridescent pixel-sequin makeup on "
            "the eyelid in sharp detail, hazel-green iris, eyelashes. In the pupil and on the wet surface of the eye a clear reflection of a "
            "vertical smartphone screen with a bright feed of colorful video thumbnails mid-scroll. Soft warm window light, deep shadows.")),
        dict(id="s2", prompt=(
            "Aerial drone view looking straight down at a busy crossroads in central Warsaw in heavy rain at dusk, the Palace of Culture and "
            "Science tower visible at the top edge of the frame. Hundreds of people with black umbrellas crossing, wet asphalt reflecting "
            "city lights, cold blue-grey colors. Exactly in the center one single signal-yellow umbrella standing perfectly still, the only "
            "color in the frame.")),
        dict(id="s3", refs=["face"], prompt=(
            "Inside a modern Warsaw tram at night, full of commuters sitting and standing, every single person looking down at a glowing "
            f"phone, faces lit blue by the screens. In the middle of the frame sits {CHAR}, the only person without a phone, looking "
            "straight into the camera, calm. Medium shot, she is clearly recognizable. Cool blue light, her yellow suit glowing warm.")),
        dict(id="s4", refs=["face"], prompt=(
            f"A Polish milk bar from the PRL era: tiled walls, formica tables, a menu board, steam from the kitchen. {CHAR} sits at a table "
            "on the right, looking at the camera. In the center a white porcelain plate of pierogi has fallen from a waitress's tray and is "
            "frozen in mid-air, its edge already shattering into hundreds of tiny glowing square pixels in electric blue, turquoise and "
            "gold, the same as her makeup. Warm practical light.")),
        dict(id="s5", refs=["face"], prompt=(
            "A winter Baltic Sea beach in Poland, overcast, snow on the sand. A gigantic grey-green wave, three storeys high, is frozen in "
            f"the air at its crest, foam and droplets suspended. {CHAR} walks calmly along the sand under the frozen wave toward the "
            "camera, full body, her yellow suit the only warm color. Cinematic wide shot, soft diffused light.")),
        dict(id="s6", refs=["face"], prompt=(
            "The rocky summit of a mountain in the Polish Tatras at sunrise, above a sea of clouds. On the very top stands a signal-yellow "
            f"armchair; {CHAR} sits in it relaxed, legs crossed, looking into the camera. Golden sunlight, deep blue sky, wide shot, she is "
            "clearly recognizable.")),
    ],
    clips=[
        dict(id="c1", first="s1", secs=3, prompt=(
            "Extreme macro shot, locked-off. The reflected feed in her pupil scrolls quickly upward, then she blinks once, slowly, and when "
            "the eye opens the reflected feed has stopped completely; the pixel sequins on the eyelid glint. Sound: fast soft swipe ticks "
            "that stop abruptly at the blink, then silence and one soft breath. Nobody speaks. No music. No text, no logos.")),
        dict(id="c2", first="s2", secs=3, prompt=(
            "Aerial drone shot looking straight down; the camera slowly descends and pushes in toward the single yellow umbrella in the "
            "center. Everyone around hurries in fast motion, black umbrellas streaming past in every direction like a scrolling feed, car "
            "light trails; the yellow umbrella stays perfectly still. Sound: heavy rain, city traffic, hurried footsteps. Nobody speaks. "
            "No music. No text, no logos.")),
        dict(id="c3", first="s3", secs=3, prompt=(
            "Medium shot, slow push-in toward her. Everyone around her scrolls their phones, thumbs swiping, screens flickering, the tram "
            "sways and city lights slide past the windows. She stays perfectly still and keeps calm eye contact with the lens, lips closed. "
            "Sound: tram rumble, rapid soft phone taps. Nobody speaks. No music. No text, no logos.")),
        dict(id="c4", first="s4", secs=3, prompt=(
            "Locked-off shot with a very slow push-in. Time is frozen: the falling plate, the pierogi and the glowing pixel fragments hang "
            "motionless in the air, the steam is frozen, the waitress is frozen mid-motion. Only the woman in the yellow suit moves: she "
            "slowly turns her head and looks into the lens with a faint knowing smile, lips closed. Sound: one high crystalline ringing "
            "tone, otherwise total silence. Nobody speaks. No music. No text, no logos.")),
        dict(id="c5", first="s5", secs=3, prompt=(
            "Wide shot, the camera tracks slowly backward in front of her. She walks calmly along the snowy beach toward the camera; the "
            "gigantic wave behind her stays frozen in the air, droplets hanging motionless and glittering; only the wind moves her hair "
            "slightly. Sound: wind, distant gulls, a deep low rumble from the frozen wave. Nobody speaks. No music. No text, no logos.")),
        dict(id="c6", first="s6", secs=3, prompt=(
            "The camera slowly pulls back and rises, revealing more of the vast sea of clouds; she sits relaxed in the yellow armchair "
            "on the summit, looking into the lens, the clouds flow slowly below, the sun flares. Sound: high mountain wind. Nobody speaks. "
            "No music. No text, no logos.")),
        dict(id="c7", first="room", last="face", secs=4, prompt=(
            "One continuous slow push-in, no cuts, from the wide shot to a tight close-up of her face; the push-in takes the full four "
            "seconds. She stays seated and still, then looks deep into the lens and smiles faintly, lips closed; the pixel sequins shimmer. "
            "Sound: quiet room tone, a soft ticking clock. Nobody speaks. No music. No text, no logos.")),
    ],
)
VOICE = "N0GCuK2B0qwWozQNTS8F"   # Magdalena - Mighty and Calm (wybór użytkownika 2026-10-06)
VO = ["[whispers] Sekunda.",
      "Tyle ma Twoja firma, zanim ktoś przewinie dalej.",
      "Miasto przewija. Tramwaj przewija. Cała Polska przewija.",
      "Chyba że zobaczy coś, czego jeszcze nie widział.",
      "[whispers] Właśnie to zrobiłeś.",
      "Clips for you. Rolki, przy których kciuk staje."]

if __name__ == "__main__":
    kino.main(HERE, PLAN)
