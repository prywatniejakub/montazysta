r"""Muzyka ElevenLabs do próbek leadów 2026-10-05 (cache w motion/kuba/assets/music).
  ..\..\..\runtime\python.exe muzyka.py schrony shift krzesla aqua
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib"))
import c4ykit
kit = c4ykit.kit
TRACKS = {
    "schrony": ("schrony_dark", "Dark cinematic documentary underscore, slow tense pulse, deep sub bass hits, airy synth pads, subtle ticking, "
                "modern luxury real estate tour meets thriller, builds to a confident reveal, no vocals", 32),
    "shift": ("shift_work_beat", "Upbeat modern hip hop instrumental beat, punchy kick and snare, workshop percussion like hammer taps and "
              "metal clinks, positive energetic money vibe, social media reel, no vocals", 30),
    "krzesla": ("krzesla_house", "Stylish modern deep house instrumental, warm groove, elegant interior design showroom vibe, soft claps, "
                "plucky synth, upbeat but classy, no vocals", 30),
    "aqua": ("aqua_clean", "Clean bright corporate tech instrumental, water drop plucks, light electronic beat, crystal clear, optimistic, "
             "product launch reel, no vocals", 30),
}
for k in sys.argv[1:]:
    name, prompt, secs = TRACKS[k]
    print(k, kit.music(name, prompt, secs))
