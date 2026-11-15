"""Places voice lines (lines.json) on the bar grid of the BUM track and re-arranges the music around them.

plan(here, drop=i, breakdown=j) ->
  * the lines before `drop` sit on the sparse intro bars and end ~0.6 s before the drop (riser room)
  * line `drop` starts on the drop hit; later lines follow with `gap`
  * optional line `breakdown` gets a quiet intro bar under it, the next line lands on a re-drop
  * the last line (CTA) starts on the ending hit
Writes timing.json (for audiokit) and timing.js (window.TIMING for the page).
"""
import json, math, os

BAR, H0 = 2.52667, .024
BEAT = BAR / 4
CUT = .05
MUSIC_LEN = 20.4
b = lambda n: H0 + n * BEAT
BARS = {"D0": 16, "D1": 20, "I1": 4}  # first source beat of each 4-beat bar


def plan(here, drop, breakdown=None, gap=.35, hold=2.3, pre_room=.6, min_intro=8):
    lines = json.load(open(os.path.join(here, "lines.json"), encoding="utf-8"))
    n = len(lines)
    dur = [l["end"] - l["start"] for l in lines]
    pre = sum(dur[:drop]) + gap * max(0, drop - 1)
    n_intro = max(min_intro, math.ceil((pre + pre_room + .15) / BEAT))
    n_intro += n_intro % 2
    DROP = b(n_intro)
    slots = [0.0] * n
    t = DROP - pre_room - pre
    for i in range(drop):
        slots[i] = t
        t += dur[i] + gap
    slots[drop] = DROP + .07
    t = slots[drop] + dur[drop] + gap
    bar_at = lambda x: DROP + math.ceil((x - .15 - DROP) / BAR) * BAR  # first bar start at/after x (slack .15)
    BRK = REDROP = None
    for i in range(drop + 1, n - 1):
        if i == breakdown:
            BRK = bar_at(t)
            slots[i] = BRK + .1
            nb = max(1, math.ceil((dur[i] + .2) / BAR))
            REDROP = BRK + nb * BAR
            t = REDROP + .07
            continue
        slots[i] = t
        t += dur[i] + gap
    END = DROP + math.ceil((t - .15 - DROP) / (BAR / 2)) * (BAR / 2)  # the ending hit may come after half a bar
    if REDROP is not None and END < REDROP:
        END = REDROP
    slots[-1] = END + .12
    DUR = round(slots[-1] + dur[-1] + hold, 1)

    # music: which source bar plays under every video bar after the drop
    beats_after = round((END - DROP) / BEAT)
    bars, since = [], 0
    for k in range(math.ceil(beats_after / 4)):
        x = DROP + k * BAR
        if BRK is not None and BRK - 1e-6 <= x < REDROP - 1e-6:
            bars.append("I1")
            since = 0  # the bar after the breakdown restarts on D0 = the re-drop hit
        else:
            since += 1
            bars.append("D0" if since % 2 == 1 else "D1")
    # (source start, source end, video start); the intro is the tail of the sparse part, wrapped over bars 1-3
    src_beats = [16 - n_intro + i for i in range(n_intro)]
    src_beats = [s if s >= 0 else 4 + (s - 4) % 12 for s in src_beats]
    for j in range(beats_after):
        src_beats.append(BARS[bars[j // 4]] + j % 4)
    segs, v = [], 0
    while v < len(src_beats):
        w = v
        while w + 1 < len(src_beats) and src_beats[w + 1] == src_beats[w] + 1:
            w += 1
        sa, sz, va = b(src_beats[v]) - CUT, b(src_beats[w] + 1) - CUT, b(v) - CUT
        if va < 0:
            sa, va = sa - va, 0.0
        segs.append([round(sa, 4), round(sz, 4), round(va, 4)])
        v = w + 1
    segs.append([round(b(24) - CUT, 4), MUSIC_LEN, round(END - CUT, 4)])

    timing = {"DUR": DUR, "DROP": DROP, "BRK": BRK, "REDROP": REDROP, "END": END, "BAR": BAR, "BEAT": BEAT, "H0": H0,
              "segments": segs, "lines": []}
    for l, s in zip(lines, slots):
        timing["lines"].append({"text": l["text"], "slot": round(s, 3), "src": [l["start"], l["end"]],
                                "words": [{"w": w["w"], "t": round(s + w["s"] - l["start"], 3), "e": round(s + w["e"] - l["start"], 3)} for w in l["words"]]})
    with open(os.path.join(here, "timing.json"), "w", encoding="utf-8") as f:
        json.dump(timing, f, ensure_ascii=False, indent=1)
    with open(os.path.join(here, "timing.js"), "w", encoding="utf-8") as f:
        f.write("window.TIMING = " + json.dumps(timing, ensure_ascii=False) + ";\n")
    print(f"DROP {DROP:.2f}  BRK {BRK and round(BRK, 2)}  REDROP {REDROP and round(REDROP, 2)}  END {END:.2f}  DUR {DUR}")
    for L in timing["lines"]:
        print(f"  {L['slot']:6.2f}  " + " ".join(f"{w['w']}@{w['t']:.2f}" for w in L["words"]))
    return timing


def arrange(here, drop, breakdown=None, accents=(), gap=.35, hold=2.3, pre_room=.6, t0=.12, min_drop=2.6, quiet=False):
    """Voice-first version of plan() for the variant templates (plan() stays as it was for ads 6-10).

    * the first line starts at t0 (a hook must not open on silence); the music grid is anchored on the drop hit,
      so the intro simply starts mid-beat at 0 s
    * drop / breakdown / accents may be line indices or line keys (lines.json "key")
    * an accent line starts on the next half bar and the drop bars restart there (D0 hit under its first word)
    Writes timing.json + timing.js like plan(); extra fields: GRID0, ACC (accent hits), beats (video beat times).
    """
    lines = json.load(open(os.path.join(here, "lines.json"), encoding="utf-8"))
    n = len(lines)
    keys = [l.get("key") for l in lines]
    ix = lambda k: k if k is None or isinstance(k, int) else keys.index(k)
    drop, breakdown, accents = ix(drop), ix(breakdown), {ix(k) for k in accents}
    dur = [l["end"] - l["start"] for l in lines]
    slots = [0.0] * n
    pre = sum(dur[:drop]) + gap * max(0, drop - 1)
    DROP = max(t0 + pre + pre_room, min_drop) if drop else t0
    spread = min(.25, (DROP - t0 - pre - pre_room) / (drop - 1)) if drop > 1 else 0  # a too early drop waits
    t = t0
    for i in range(drop):
        slots[i] = t
        t += dur[i] + gap + spread
    slots[drop] = DROP + .07
    t = slots[drop] + dur[drop] + gap
    grid0, marks = DROP, [(DROP, "D")]  # music restarts: "D" = drop bars D0 D1 D0 ..., "I" = quiet intro bars
    step = lambda x, unit: grid0 + max(0, math.ceil((x - .15 - grid0) / unit - 1e-6)) * unit
    BRK = REDROP = None
    ACC = []
    for i in range(drop + 1, n - 1):
        if i == breakdown:
            BRK = step(t, BAR / 2)  # half bar: the quiet bars never wait more than 1.3 s for the voice
            slots[i] = BRK + .1
            REDROP = BRK + max(1, math.ceil((dur[i] + .2) / BAR)) * BAR
            marks += [(BRK, "I"), (REDROP, "D")]
            grid0, t = REDROP, REDROP + .07
            continue
        if i in accents:
            A = step(t, BAR / 2)
            if A > grid0 + 1e-6:
                marks.append((A, "D"))
                grid0 = A
            if REDROP is None or abs(A - REDROP) > .01:
                ACC.append(round(A, 4))
            slots[i] = A + .07
        else:
            slots[i] = t
        t = slots[i] + dur[i] + gap
    END = step(t, BAR / 2)
    if REDROP is not None and END < REDROP:
        END = REDROP
    slots[-1] = END + .12
    DUR = round(slots[-1] + dur[-1] + hold, 1)

    # music, beat by beat: (video time, source beat), then merged into continuous source segments
    beats = []
    n_intro = math.ceil((DROP + CUT) / BEAT) if drop else 0
    for k in range(n_intro, 0, -1):
        s = 16 - k
        beats.append((DROP - k * BEAT, s if s >= 0 else 4 + (s - 4) % 12))
    marks.sort()
    for m, (at, kind) in enumerate(marks):
        until = marks[m + 1][0] if m + 1 < len(marks) else END
        for j in range(round((until - at) / BEAT)):
            src = BARS["I1"] if kind == "I" else BARS["D0" if (j // 4) % 2 == 0 else "D1"]
            beats.append((at + j * BEAT, src + j % 4))
    segs, v = [], 0
    while v < len(beats):
        w = v
        while w + 1 < len(beats) and beats[w + 1][1] == beats[w][1] + 1 and abs(beats[w + 1][0] - beats[w][0] - BEAT) < 1e-3:
            w += 1
        sa, sz, va = b(beats[v][1]) - CUT, b(beats[w][1] + 1) - CUT, beats[v][0] - CUT
        if va < 0:
            sa, va = sa - va, 0.0
        if sz - sa > .01:
            segs.append([round(sa, 4), round(sz, 4), round(va, 4)])
        v = w + 1
    segs.append([round(b(24) - CUT, 4), MUSIC_LEN, round(END - CUT, 4)])

    timing = {"DUR": DUR, "DROP": round(DROP, 4), "BRK": BRK and round(BRK, 4), "REDROP": REDROP and round(REDROP, 4),
              "END": round(END, 4), "BAR": BAR, "BEAT": BEAT, "H0": H0, "GRID0": round(DROP - n_intro * BEAT, 4),
              "ACC": ACC, "beats": [round(x, 4) for x, _ in beats if x >= -1e-6] + [round(END, 4)],
              "segments": segs, "lines": []}
    for l, s in zip(lines, slots):
        timing["lines"].append({"key": l.get("key"), "text": l["text"], "slot": round(s, 3), "src": [l["start"], l["end"]],
                                "words": [{"w": w["w"], "t": round(s + w["s"] - l["start"], 3), "e": round(s + w["e"] - l["start"], 3)} for w in l["words"]]})
    with open(os.path.join(here, "timing.json"), "w", encoding="utf-8") as f:
        json.dump(timing, f, ensure_ascii=False, indent=1)
    with open(os.path.join(here, "timing.js"), "w", encoding="utf-8") as f:
        f.write("window.TIMING = " + json.dumps(timing, ensure_ascii=False) + ";\n")
    if not quiet:
        print(f"DROP {DROP:.2f}  BRK {BRK and round(BRK, 2)}  REDROP {REDROP and round(REDROP, 2)}  ACC {ACC}  END {END:.2f}  DUR {DUR}")
        for L in timing["lines"]:
            print(f"  {L['slot']:6.2f}  [{L['key']}] " + " ".join(f"{w['w']}@{w['t']:.2f}" for w in L["words"]))
    return timing
