r"""Film page check (headless Edge): JS errors, render errors on the whole timeline AND text overflow.
Overflow = any text whose rendered box sticks out of its nearest visual box (an ancestor with a border or a background:
pill, stamp, card, bubble, phone...) by more than 3 px. Every scene is checked at 5 moments (texts change: counters, typing).
  ..\..\..\runtime\python.exe check.py f1\f1.html        -> exit code 1 when anything is wrong (c4yfilm blocks the render)
"""
import sys, os, json
M = ((__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio")) + "/motion")
sys.path.insert(0, M)
import render

JS = r"""
(() => {
  const out = [], seen = new Set();
  const isBox = e => { if (!e || e === document.body) return false; const cs = getComputedStyle(e);
    const bg = cs.backgroundColor, img = cs.backgroundImage;
    return (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') || (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || (img && img !== 'none' && !e.classList.contains('mk')); };
  const bad = e => e.closest('.sc') && e.closest('.sc').style.display === 'none';
  const scan = t => {
    const w = document.createTreeWalker(document.getElementById('stage'), NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      const tx = n.textContent.trim(); if (!tx) continue; const p = n.parentElement; if (!p || bad(p)) continue;
      let b = p; while (b && !isBox(b)) { if (b.classList && (b.classList.contains('sc') || b.classList.contains('cam'))) { b = null; break; } b = b.parentElement; }
      if (!b || b.id === 'stage') continue;
      const cs = getComputedStyle(b); if (cs.display === 'none' || +cs.opacity === 0) continue;
      const r = document.createRange(); r.selectNodeContents(n); const tr = r.getBoundingClientRect(), br = b.getBoundingClientRect();
      if (!tr.width || !br.width || br.width < 40 || br.height < 20) continue;  // popping in (spring scale ~0): not a layout bug
      const bw = parseFloat(cs.borderLeftWidth) || 0, m = 3;
      const inl = cs.display === "inline", over = Math.max(br.left + bw - tr.left, tr.right - (br.right - bw), inl ? 0 : br.top + bw - tr.top, inl ? 0 : tr.bottom - (br.bottom - bw));
      if (over > m) { const k = tx.slice(0, 40) + '|' + (b.className || b.tagName); if (!seen.has(k)) { seen.add(k); out.push({ t: +t.toFixed(2), text: tx.slice(0, 60), box: String(b.className || b.tagName).slice(0, 40), px: Math.round(over) }); } }
    }
  };
  const errs = [];
  for (const s of SCN) { const a = Math.max(0, s.a), z = Math.min(DUR, s.z); for (const f of [.35, .6, .8, .95, 1.0]) { const t = a + (z - a) * f; try { window.render(t); scan(t); } catch (x) { errs.push(t.toFixed(2) + ': ' + x.message); } } }
  for (let t = 0; t < DUR; t += 0.5) { try { window.render(t); } catch (x) { errs.push(t.toFixed(2) + ': ' + x.message); } }
  return JSON.stringify({ over: out, errs: errs.slice(0, 12) });
})()
"""


def check(page, port=9356):
    b = render.Browser(port)
    try:
        b.open(os.path.abspath(page))
        n = b.js("SCN.length"); load = json.loads(b.js("JSON.stringify(window.ERRORS)") or "[]")
        res = json.loads(b.js(JS))
    finally:
        b.close()
    print(f"scenes: {n}  load errors: {load}  render errors: {res['errs']}")
    for o in res["over"]:
        print(f"  OVERFLOW t={o['t']:7.2f}  {o['px']:3d}px  [{o['box']}]  {o['text']}")
    ok = not load and not res["errs"] and not res["over"]
    print("CHECK OK" if ok else f"CHECK FAILED ({len(res['over'])} overflow)")
    return ok


if __name__ == "__main__":
    sys.exit(0 if check(sys.argv[1]) else 1)
