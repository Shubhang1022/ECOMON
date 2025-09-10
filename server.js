const express = require("express");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

// add DB helper (uses MONGO_URI from .env or fallback)
const { connect: connectDb } = require("./db");

const app = express();
app.use(express.json());

// Request logger (helps debug incoming requests)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Basic fetch availability check (Node 18+ has global fetch)
if (typeof fetch === "undefined") {
  console.warn(
    "Global fetch is not available. Run this server with Node 18+ or add a fetch polyfill (e.g. node-fetch). Proxy requests may fail."
  );
}

// Config
const PORT = process.env.PORT || 8080;
const API_URL =
  process.env.GEMINI_API_URL ||
  "https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.0:generateText";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY not set. Set it in .env before starting the server.");
}

// API proxy endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    if (!API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not set on server. Set GEMINI_API_KEY in .env or environment before starting the server."
      });
    }

    // determine model to call: prefer explicit GEMINI_API_URL, else use GEMINI_MODEL (fallback to text-bison-001)
    const MODEL_NAME = process.env.GEMINI_MODEL || "text-bison-001";
    const explicit = API_URL && API_URL.trim() !== "" ? API_URL : null;

    const candidateUrls = [
      explicit,
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateMessage`,
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateText`,
      `https://generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateMessage`,
      `https://generativelanguage.googleapis.com/v1beta2/models/${MODEL_NAME}:generateText`
    ]
      .filter(Boolean)
      .reduce((acc, u) => (acc.includes(u) ? acc : acc.concat(u)), []);

    console.log("Candidate Gemini endpoints:", candidateUrls);

    let lastErr = null;

    for (const url of candidateUrls) {
      const isMessage = url.includes(":generateMessage") || url.includes(":generateContent") || url.includes("/generateMessage");
      const payload = isMessage
        ? {
            messages: [
              { author: "system", content: [{ type: "text", text: "You are a helpful quiz generator." }] },
              { author: "user", content: [{ type: "text", text: prompt }] }
            ],
            temperature: 0.2,
            maxOutputTokens: 800
          }
        : {
            prompt: { text: prompt },
            temperature: 0.2,
            maxOutputTokens: 800
          };

      const fullUrl = `${url}?key=${encodeURIComponent(API_KEY)}`;
      console.log("Trying Gemini endpoint:", fullUrl);

      try {
        const r = await fetch(fullUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const text = await r.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        if (r.ok) {
          console.log("Success from:", url);
          return res.json({ data, usedEndpoint: url });
        }

        lastErr = { status: r.status, body: data, endpoint: url };
        const lower = String(text).toLowerCase();

        if ((r.status === 400 && (lower.includes("unknown name") || lower.includes("invalid json payload"))) || r.status === 404) {
          console.warn(`Endpoint ${url} rejected payload (${r.status}). Continuing to next candidate. Snippet:`, String(text).slice(0, 400));
          continue;
        }

        if (r.status === 401 || r.status === 403) {
          return res.status(r.status).json({ error: data, endpoint: url });
        }

        continue;
      } catch (fetchErr) {
        lastErr = { error: String(fetchErr), endpoint: url };
        console.warn("Fetch error for", url, fetchErr);
        continue;
      }
    }

    return res.status(502).json({
      error: "All Gemini endpoints failed",
      lastError: lastErr,
      troubleshooting: [
        "Ensure GEMINI_API_KEY in .env is correct and has access to the Generative Language API.",
        "Check that the model name (gemini-1.0) is available to your project — some models require enablement or billing.",
        "If you see 404 for all endpoints, try GEMINI_MODEL=text-bison-001 in .env to test a public model."
      ]
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: err?.message || "proxy error" });
  }
});

const DATA_DIR = path.join(__dirname, "QUIZES");
const EASY_PATH = path.join(DATA_DIR, "easy.json");

// load dataset (safe, non-crashing)
let datasets = { easy: [], medium: [], hard: [] };
try {
  if (fs.existsSync(EASY_PATH)) {
    const raw = fs.readFileSync(EASY_PATH, "utf8");
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      datasets.easy = arr.map((q, i) => ({
        id: q.id ?? i,
        question: String(q.question ?? q.q ?? `Question ${i + 1}`),
        options: Array.isArray(q.options) ? q.options.map(String) : ["Option A","Option B","Option C","Option D"],
        answer: Number.isFinite(q.answer) ? Number(q.answer) : 0,
        explanation: String(q.explanation ?? "")
      }));
    } else {
      console.warn("easy.json parsed but is not an array");
    }
  } else {
    console.warn("easy.json not found at", EASY_PATH);
  }
} catch (e) {
  console.error("Failed to load easy.json:", e);
}

// simple shuffle
const shuffleArray = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// preserve answer index when shuffling options
const randomizeQuestionOptions = (q) => {
  const indexed = q.options.map((opt, i) => ({ opt, i }));
  const shuffled = shuffleArray(indexed);
  const newOptions = shuffled.map((s) => s.opt);
  const newAnswer = shuffled.findIndex((s) => s.i === q.answer);
  return { ...q, options: newOptions, answer: newAnswer >= 0 ? newAnswer : 0 };
};

// ensure request logger exists (helps debug 404)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// dataset endpoint
app.post("/api/dataset-quiz", (req, res) => {
  try {
    const { level = "easy", count = 5 } = req.body || {};
    const lvl = String(level).toLowerCase();
    if (!["easy", "medium", "hard"].includes(lvl)) {
      return res.status(400).json({ error: "level must be easy|medium|hard" });
    }

    const pool = datasets[lvl] || [];
    if (!pool.length) {
      return res.status(404).json({ error: `No dataset found for level ${lvl}` });
    }

    const n = Math.min(Math.max(Number(count) || 5, 1), pool.length);
    const sampled = shuffleArray(pool).slice(0, n).map(randomizeQuestionOptions);

    return res.json({ source: "dataset", level: lvl, count: sampled.length, questions: sampled });
  } catch (err) {
    console.error("dataset-quiz error", err);
    return res.status(500).json({ error: "failed to produce quiz" });
  }
});

// final 404 handler (leave last)
app.use((req, res) => {
  console.warn(`UNMATCHED ROUTE: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Start server after DB connection
(async () => {
  try {
    await connectDb();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Failed to start server - DB connection error:", err);
    process.exit(1);
  }
})();