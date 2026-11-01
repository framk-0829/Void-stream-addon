import "dotenv/config";
import express from "express";
import { demoMovies, demoSeries, demoChannels } from "./catalog.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 7000);
const BASE = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const ADDON_NAME = process.env.ADDON_NAME || "VOID STREAM";
const LANGS = ["English", "Spanish"];

function parseArrayEnv(name) {
  try { return JSON.parse(process.env[name] || "[]"); }
  catch { console.warn(`Invalid JSON in ${name}; ignoring it.`); return []; }
}
const customSources = parseArrayEnv("MEDIA_SOURCES_JSON");
const liveChannels = parseArrayEnv("LIVE_CHANNELS_JSON");

const manifest = {
  id: "community.voidstream.nuvio",
  version: "1.0.0",
  name: ADDON_NAME,
  description: "A customizable bilingual media catalog and authorized-source selector for Nuvio.",
  logo: "https://dummyimage.com/256x256/171126/ffffff.png&text=VOID",
  resources: ["catalog", "meta", "stream", "subtitles"],
  types: ["movie", "series", "channel"],
  catalogs: [
    { type: "movie", id: "void-movies", name: "VOID STREAM • Movies", extra: [{ name: "search", isRequired: false }, { name: "genre", isRequired: false }] },
    { type: "series", id: "void-series", name: "VOID STREAM • Series", extra: [{ name: "search", isRequired: false }, { name: "genre", isRequired: false }] },
    { type: "channel", id: "void-live", name: "VOID STREAM • Live TV" }
  ],
  idPrefixes: ["void:"]
};

const allItems = () => [
  ...demoMovies,
  ...demoSeries,
  ...demoChannels,
  ...liveChannels.map((c, i) => ({ ...c, id: c.id || `void:live-${i}`, type: "channel" }))
];

function itemById(id) { return allItems().find(x => x.id === id); }
function sourceListFor(id) {
  const item = itemById(id);
  const embedded = item?.streams || [];
  return [...embedded, ...customSources.filter(s => s.contentId === id)];
}
function languageLabel(source) {
  const audio = (source.audio || []).join("/") || "Audio not specified";
  const subs = (source.subtitles || []).map(s => s.lang).filter(Boolean).join("/") || "No subtitles listed";
  return `Audio: ${audio} • Subs: ${subs}`;
}
async function probe(url) {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    // A short ranged request avoids downloading an entire media file.
    const response = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, signal: controller.signal, redirect: "follow" });
    const ms = Math.round(performance.now() - start);
    await response.body?.cancel();
    return { ms, ok: response.ok || response.status === 206 || response.status === 416 };
  } catch {
    return { ms: null, ok: false };
  } finally { clearTimeout(timer); }
}

app.get("/manifest.json", (_req, res) => res.json(manifest));

app.get("/catalog/:type/:catalogId.json", (req, res) => {
  const { type, catalogId } = req.params;
  const search = String(req.query.search || "").toLowerCase();
  const genre = String(req.query.genre || "").toLowerCase();
  let items = catalogId === "void-live" ? allItems().filter(x => x.type === "channel")
    : catalogId === "void-series" ? allItems().filter(x => x.type === "series")
    : allItems().filter(x => x.type === "movie");
  if (type !== "channel" && type !== "movie" && type !== "series") return res.json({ metas: [] });
  if (search) items = items.filter(x => x.name?.toLowerCase().includes(search));
  if (genre) items = items.filter(x => (x.genres || []).some(g => g.toLowerCase() === genre));
  res.json({ metas: items.map(({ streams, ...meta }) => meta) });
});

app.get("/meta/:type/:id.json", (req, res) => {
  const item = itemById(req.params.id);
  if (!item || item.type !== req.params.type) return res.status(404).json({ meta: null });
  const { streams, ...meta } = item;
  res.json({ meta });
});

app.get("/stream/:type/:id.json", async (req, res) => {
  const candidates = sourceListFor(req.params.id);
  const checked = await Promise.all(candidates.map(async (s) => {
    if (!s.url || !/^https?:\/\//i.test(s.url)) return null;
    const test = await probe(s.url);
    return { ...s, test };
  }));
  const available = checked.filter(Boolean);
  // Working sources first, then measured response time. Unknown/failed probes remain visible but lower.
  available.sort((a, b) => {
    const aScore = a.test.ok ? 0 : 1, bScore = b.test.ok ? 0 : 1;
    return aScore - bScore || (a.test.ms ?? 99999) - (b.test.ms ?? 99999);
  });
  const streams = available.map((s, i) => ({
    name: `${s.name || s.server || "Authorized source"}${i === 0 && s.test.ok ? " • FASTEST TESTED" : ""}`,
    title: `${s.quality || "Quality unknown"} • ${languageLabel(s)} • ${s.test.ms == null ? "Latency unknown" : `${s.test.ms} ms response`} • ${s.test.ok ? "Responding" : "Unverified / unavailable"}`,
    url: s.url,
    behaviorHints: { notWebReady: false }
  }));
  res.json({ streams });
});

app.get("/subtitles/:type/:id/:videoId.json", (req, res) => {
  const sources = sourceListFor(req.params.id);
  const subtitles = sources.flatMap(s => (s.subtitles || []).filter(x =>
    x.url && ["English", "Spanish", "en", "es"].includes(x.lang)
  ).map(x => ({ id: x.id || `${s.name || "source"}-${x.lang}`, url: x.url, lang: x.lang })));
  res.json({ subtitles });
});

app.get("/", (_req, res) => res.type("text").send(`${ADDON_NAME} is running. Install ${BASE}/manifest.json in Nuvio.`));
app.get("/health", (_req, res) => res.json({ ok: true, name: ADDON_NAME, configuredSources: customSources.length, liveChannels: liveChannels.length }));

app.listen(PORT, () => console.log(`${ADDON_NAME} listening on ${BASE}`));
