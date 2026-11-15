// Colour palettes of the variant templates (motion/szablony). A = main accent gradient (titles, clock hands, highlights),
// B = second accent, blobs = background light (rgb, template decides where they sit), ext = side colour of 3D titles.
// Semantic colours (green = done / free, red = problem) stay fixed in the templates. The generator reads this file:
// keep it "window.PALETTES = {json};".
window.PALETTES = {
 "fiolet": {"A": ["#8fb4ff", "#a98bff", "#f3a6ff"], "B": ["#5ee7ff", "#4f8cff", "#9b7bff"],
  "blobs": ["40,110,255", "125,60,255", "30,190,110", "0,200,255", "255,90,80"],
  "btn": "linear-gradient(135deg, #7c5cff 0%, #4f8cff 100%)", "btnglow": "rgba(110,110,255,.55)",
  "ray": "rgba(130,170,255,.16)", "glow1": "rgba(70,120,255,.55)", "glow2": "rgba(90,60,255,.18)", "flash": "#cfe0ff", "ext": [122, 140, 196]},
 "zloto": {"A": ["#ffe8a3", "#ffb65c", "#ff6b8b"], "B": ["#8fb4ff", "#a98bff", "#f3a6ff"],
  "blobs": ["255,170,90", "255,90,140", "125,60,255", "40,110,255", "255,190,110"],
  "btn": "linear-gradient(135deg, #ffb65c 0%, #ff6b8b 55%, #8b6cff 100%)", "btnglow": "rgba(255,120,120,.45)",
  "ray": "rgba(255,200,140,.14)", "glow1": "rgba(255,160,90,.42)", "glow2": "rgba(255,90,140,.16)", "flash": "#fff1dc", "ext": [200, 150, 110]},
 "turkus": {"A": ["#c3fff4", "#3ee6d0", "#38a3ff"], "B": ["#e0f2fe", "#7dd3fc", "#a78bfa"],
  "blobs": ["0,200,190", "30,110,255", "0,170,255", "100,80,255", "40,220,170"],
  "btn": "linear-gradient(135deg, #22d3c5 0%, #3b82f6 100%)", "btnglow": "rgba(40,200,210,.45)",
  "ray": "rgba(120,240,230,.14)", "glow1": "rgba(30,200,200,.45)", "glow2": "rgba(60,120,255,.18)", "flash": "#d9fffb", "ext": [100, 180, 190]},
 "roz": {"A": ["#ffd6f2", "#ff6bcb", "#b35cff"], "B": ["#ffe7b3", "#ffa27a", "#ff6b9a"],
  "blobs": ["255,60,170", "160,60,255", "255,110,110", "90,60,255", "255,150,200"],
  "btn": "linear-gradient(135deg, #ff5fbf 0%, #9b5cff 100%)", "btnglow": "rgba(255,90,190,.45)",
  "ray": "rgba(255,160,220,.14)", "glow1": "rgba(255,80,180,.42)", "glow2": "rgba(140,70,255,.18)", "flash": "#ffe6f6", "ext": [196, 120, 176]},
 "ogien": {"A": ["#fff0b3", "#ffa040", "#ff4a3d"], "B": ["#ffe8a3", "#ff9f7a", "#ff5f8f"],
  "blobs": ["255,120,40", "255,50,70", "255,180,70", "150,50,200", "255,90,40"],
  "btn": "linear-gradient(135deg, #ff9a3c 0%, #ff3d5a 100%)", "btnglow": "rgba(255,110,60,.5)",
  "ray": "rgba(255,170,110,.15)", "glow1": "rgba(255,120,50,.45)", "glow2": "rgba(255,50,80,.18)", "flash": "#fff0e0", "ext": [210, 140, 100]},
 "srebro": {"A": ["#ffffff", "#cfd9ff", "#8ea2ff"], "B": ["#e8ecff", "#b9c4ff", "#d4b8ff"],
  "blobs": ["70,90,170", "90,70,160", "60,120,190", "110,110,170", "80,80,140"],
  "btn": "linear-gradient(135deg, #5b6cff 0%, #2f9bff 100%)", "btnglow": "rgba(110,130,255,.45)",
  "ray": "rgba(200,210,255,.12)", "glow1": "rgba(120,140,255,.4)", "glow2": "rgba(160,120,255,.15)", "flash": "#eef2ff", "ext": [150, 160, 190]}
};
