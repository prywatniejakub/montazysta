// darmowy lektor Microsoft Edge (msedge-tts): node gen.mjs <out_dir> <voice> <rate> <json lines [[key,text],...]>
// linie już zrobione (ten sam tekst, głos i tempo) są pomijane; przy 429/403 ponowienie z odczekaniem
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs"; import path from "path";
const [out, voice, rate, file] = process.argv.slice(2);
const lines = JSON.parse(fs.readFileSync(file, "utf8"));
fs.mkdirSync(out, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function one(key, text) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
  const { audioStream, metadataStream } = tts.toStream(text, { rate });
  const bufs = [], meta = [];
  metadataStream.on("data", d => meta.push(d.toString()));
  await new Promise((res, rej) => { audioStream.on("data", d => bufs.push(d)); audioStream.on("end", res); audioStream.on("error", rej); });
  await sleep(300);
  tts.close();
  const words = [];
  for (const m of meta) { for (const part of m.split(/(?<=\})(?=\{)/)) { try { const j = JSON.parse(part); for (const x of j.Metadata || []) if (x.Type === "WordBoundary") words.push({ w: x.Data.text.Text, s: x.Data.Offset / 1e7, e: (x.Data.Offset + x.Data.Duration) / 1e7 }); } catch (e) {} } }
  if (!bufs.length || !words.length) throw new Error("pusta odpowiedź");
  fs.writeFileSync(path.join(out, key + ".mp3"), Buffer.concat(bufs));
  fs.writeFileSync(path.join(out, key + ".json"), JSON.stringify({ text, voice, rate, words }, null, 1));
  console.log(key, words.length, "words", words.map(w => w.w).join(" "));
}
for (const [key, text] of lines) {
  const jp = path.join(out, key + ".json");
  if (fs.existsSync(jp) && fs.existsSync(path.join(out, key + ".mp3"))) {
    const j = JSON.parse(fs.readFileSync(jp, "utf8"));
    if (j.text === text && (j.voice ?? voice) === voice && (j.rate ?? rate) === rate) { console.log(key, "(gotowe)"); continue; }
  }
  for (let a = 0; ; a++) {
    try { await one(key, text); break; }
    catch (e) { if (a >= 6) throw e; const w = 4000 * (a + 1); console.log(key, "ponowienie za", w / 1000, "s:", String(e.message).slice(0, 80)); await sleep(w); }
  }
  await sleep(1200);
}
