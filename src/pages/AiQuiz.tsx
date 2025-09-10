import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import the JSON as raw text to avoid Vite JSON parsing errors for files that contain comments
import easyRaw from "../../QUIZES/easy.json?raw";
import mediumRaw from "../../QUIZES/medium.json?raw";
import hardRaw from "../../QUIZES/hard.json?raw";
import extremeRaw from "../../QUIZES/extreme.json?raw";

// Safely parse JSON that may contain JS-style comments (best-effort).
const safeParseJsonWithComments = (txt: string) => {
  if (!txt || typeof txt !== "string") return [];
  try {
    // remove block comments /* ... */
    let s = txt.replace(/\/\*[\s\S]*?\*\//g, "");
    // remove line comments // ...
    s = s.replace(/^\s*\/\/.*$/gm, "");
    // remove trailing commas before } or ]
    s = s.replace(/,\s*(?=[}\]])/g, "");
    return JSON.parse(s);
  } catch (e) {
    try { return JSON.parse(txt); } catch { return []; }
  }
};

const easyJson: any = safeParseJsonWithComments(easyRaw);
const mediumJson: any = safeParseJsonWithComments(mediumRaw);
const hardJson: any = safeParseJsonWithComments(hardRaw);
const extremeJson: any = safeParseJsonWithComments(extremeRaw);

// normalize external easy.json to our Question shape (detect "correct_option" or numeric "answer")
const easyFromFile: Question[] = (Array.isArray(easyJson) ? easyJson : []).map((q: any, i: number) => {
  const options = Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [];
  let answer = 0;
  if (Number.isFinite(q.answer)) {
    answer = Math.min(Math.max(Number(q.answer), 0), Math.max(0, options.length - 1));
  } else if (typeof q.correct_option === "string") {
    const idx = options.map(String).indexOf(String(q.correct_option));
    answer = idx >= 0 ? idx : 0;
  } else if (typeof q.correct === "string" || typeof q.correctOption === "string") {
    const key = q.correct || q.correctOption;
    const idx = options.map(String).indexOf(String(key));
    answer = idx >= 0 ? idx : 0;
  }
  return {
    question: String(q.question ?? q.q ?? `Question ${i + 1}`),
    options: options.length ? options : ["Option A", "Option B", "Option C", "Option D"],
    answer,
    explanation: String(q.explanation ?? "")
  } as Question;
});
// normalize external medium.json to our Question shape
const mediumFromFile: Question[] = (Array.isArray(mediumJson) ? mediumJson : []).map((q: any, i: number) => {
  const options = Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [];
  let answer = 0;
  if (Number.isFinite(q.answer)) {
    answer = Math.min(Math.max(Number(q.answer), 0), Math.max(0, options.length - 1));
  } else if (typeof q.correct_option === "string") {
    const idx = options.map(String).indexOf(String(q.correct_option));
    answer = idx >= 0 ? idx : 0;
  } else if (typeof q.correct === "string" || typeof q.correctOption === "string") {
    const key = q.correct || q.correctOption;
    const idx = options.map(String).indexOf(String(key));
    answer = idx >= 0 ? idx : 0;
  }
  return {
    question: String(q.question ?? q.q ?? `Question ${i + 1}`),
    options: options.length ? options : ["Option A", "Option B", "Option C", "Option D"],
    answer,
    explanation: String(q.explanation ?? "")
  } as Question;
});
// normalize external hard.json to our Question shape
const hardFromFile: Question[] = (Array.isArray(hardJson) ? hardJson : []).map((q: any, i: number) => {
  const options = Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [];
  let answer = 0;
  if (Number.isFinite(q.answer)) {
    answer = Math.min(Math.max(Number(q.answer), 0), Math.max(0, options.length - 1));
  } else if (typeof q.correct_option === "string") {
    const idx = options.map(String).indexOf(String(q.correct_option));
    answer = idx >= 0 ? idx : 0;
  } else if (typeof q.correct === "string" || typeof q.correctOption === "string") {
    const key = q.correct || q.correctOption;
    const idx = options.map(String).indexOf(String(key));
    answer = idx >= 0 ? idx : 0;
  }
  return {
    question: String(q.question ?? q.q ?? `Question ${i + 1}`),
    options: options.length ? options : ["Option A", "Option B", "Option C", "Option D"],
    answer,
    explanation: String(q.explanation ?? "")
  } as Question;
});
// normalize external extreme.json to our Question shape
const extremeFromFile: Question[] = (Array.isArray(extremeJson) ? extremeJson : []).map((q: any, i: number) => {
  const options = Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [];
  let answer = 0;
  if (Number.isFinite(q.answer)) {
    answer = Math.min(Math.max(Number(q.answer), 0), Math.max(0, options.length - 1));
  } else if (typeof q.correct_option === "string") {
    const idx = options.map(String).indexOf(String(q.correct_option));
    answer = idx >= 0 ? idx : 0;
  } else if (typeof q.correct === "string" || typeof q.correctOption === "string") {
    const key = q.correct || q.correctOption;
    const idx = options.map(String).indexOf(String(key));
    answer = idx >= 0 ? idx : 0;
  }
  return {
    question: String(q.question ?? q.q ?? `Question ${i + 1}`),
    options: options.length ? options : ["Option A", "Option B", "Option C", "Option D"],
    answer,
    explanation: String(q.explanation ?? "")
  } as Question;
});

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

const MOCK_QUIZZES: Record<string, Question[]> = {
  easy: [
    {
      question: "What gas do plants absorb from the air for photosynthesis?",
      options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
      answer: 1,
      explanation: "Plants take in carbon dioxide (CO2) and use sunlight to convert it into sugars during photosynthesis."
    },
    {
      question: "Which of the following is a renewable energy source?",
      options: ["Coal", "Wind", "Oil", "Natural gas"],
      answer: 1,
      explanation: "Wind energy is renewable because wind is naturally replenished and does not get used up."
    },
    {
      question: "Which layer of Earth do we live on?",
      options: ["Core", "Mantle", "Crust", "Outer core"],
      answer: 2,
      explanation: "The crust is Earth’s outermost solid layer where continents and oceans are located."
    },
    {
      question: "What is the primary cause of sea-level rise?",
      options: ["Increased rainfall", "Melting of ice and thermal expansion of water", "Tectonic uplift", "More boats in the ocean"],
      answer: 1,
      explanation: "Climate warming melts glaciers and ice sheets and also warms seawater so it expands, raising sea level."
    },
    {
      question: "Which habitat is home to many fish and coral?",
      options: ["Desert", "Tundra", "Rainforest", "Coral reef"],
      answer: 3,
      explanation: "Coral reefs are marine habitats rich in fish and coral species and are biodiversity hotspots."
    }
  ],
  medium: [
    {
      question: "What is the main effect of deforestation on the local water cycle?",
      options: ["Increases groundwater recharge", "Reduces evapotranspiration and can decrease local rainfall", "Converts rivers to streams", "Prevents cloud formation permanently"],
      answer: 1,
      explanation: "Removing trees lowers evapotranspiration, which can reduce atmospheric moisture and lead to reduced local rainfall."
    },
    {
      question: "Which soil type is most prone to allowing rapid drainage and low nutrient retention?",
      options: ["Clay", "Silt", "Sandy soil", "Loam"],
      answer: 2,
      explanation: "Sandy soils have large particles and pores that let water drain quickly, carrying away nutrients."
    },
    {
      question: "Which plate boundary is most associated with powerful earthquakes and mountain building?",
      options: ["Divergent boundary", "Transform boundary", "Convergent (collision) boundary", "Passive margin"],
      answer: 2,
      explanation: "Convergent collision boundaries (where plates push together) create mountains and strong seismic activity."
    },
    {
      question: "Why does increasing carbon dioxide in the atmosphere raise global temperatures?",
      options: ["CO2 reflects sunlight back to space", "CO2 traps outgoing infrared radiation, enhancing the greenhouse effect", "CO2 cools the stratosphere only", "CO2 blocks solar radiation from reaching Earth"],
      answer: 1,
      explanation: "CO2 absorbs and re-emits infrared energy from Earth’s surface, trapping heat and warming the planet."
    },
    {
      question: "Which human activity contributes most directly to eutrophication in lakes?",
      options: ["Planting trees near lakes", "Excessive use of fertilizers in nearby agriculture", "Fishing with nets", "Walking along the shore"],
      answer: 1,
      explanation: "Runoff of fertilizers adds nutrients like nitrogen and phosphorus to lakes, causing algal blooms and eutrophication."
    }
  ],
  hard: [
    {
      question: "Which process primarily drives large-scale ocean circulation (thermohaline circulation)?",
      options: ["Wind stress alone", "Differences in water density due to temperature and salinity", "Tidal forces", "Earth's rotation only"],
      answer: 1,
      explanation: "Thermohaline circulation is driven by density differences where cold, salty water sinks and warmer water rises, moving deep ocean currents."
    },
    {
      question: "What is the main geologic evidence used to support past continental drift?",
      options: ["Similar fossil species across distant continents and matching rock layers", "Uniform climates across all continents", "Same languages appearing worldwide", "Identical river systems on different continents"],
      answer: 0,
      explanation: "Matching fossils and rock strata across continents indicate those landmasses were once connected before drifting apart."
    },
    {
      question: "How does ocean acidification affect marine calcifiers like corals and shellfish?",
      options: ["Increases calcification rates", "Reduces carbonate ion availability and slows shell formation", "Has no effect on shells", "Makes shells harder"],
      answer: 1,
      explanation: "Higher CO2 lowers seawater pH and reduces carbonate ions needed to build calcium carbonate shells, hindering calcification."
    },
    {
      question: "Which land-use change typically causes the largest immediate loss of biodiversity?",
      options: ["Conversion of natural forest to monoculture agriculture", "Switching crops within farmland", "Building parks", "Improving irrigation systems"],
      answer: 0,
      explanation: "Replacing diverse natural habitats with single-crop plantations removes niches and causes rapid biodiversity loss."
    },
    {
      question: "What is the most effective strategy to reduce transportation CO2 emissions at national scale?",
      options: ["Encouraging single-occupant car use", "Shifting to efficient public transit, electrification and land-use planning", "Increasing road widths", "Removing bike lanes"],
      answer: 1,
      explanation: "Combining public transit, electrifying vehicles, and smart urban planning reduces vehicle miles traveled and emissions at scale."
    }
  ],
  extreme: [
    {
      question: "What is the primary driver of tectonic plate movement?",
      options: ["Wind patterns", "Ocean currents", "Heat from Earth's interior causing convection currents in the mantle", "Gravitational pull from the moon"],
      answer: 2,
      explanation: "The heat from Earth's interior causes convection currents in the mantle, which then move the tectonic plates."
    },
    {
      question: "Which layer of the Earth is liquid and responsible for Earth's magnetic field?",
      options: ["Inner core", "Outer core", "Mantle", "Crust"],
      answer: 1,
      explanation: "The outer core is liquid and its movement generates Earth's magnetic field through the dynamo effect."
    },
    {
      question: "What geological feature is formed at a divergent boundary between two tectonic plates?",
      options: ["Mountain range", "Volcano", "Mid-ocean ridge", "Deep-sea trench"],
      answer: 2,
      explanation: "A divergent boundary, where two tectonic plates move apart, typically forms a mid-ocean ridge."
    },
    {
      question: "Which type of seismic wave travels fastest and is the first to be detected by seismographs?",
      options: ["P-wave (Primary wave)", "S-wave (Secondary wave)", "Surface wave", "Love wave"],
      answer: 0,
      explanation: "P-waves are compressional waves that travel fastest through the Earth and are the first detected by seismographs."
    },
    {
      question: "What is the main cause of the Earth's seasons?",
      options: ["The distance of Earth from the sun", "The tilt of Earth's axis relative to its orbit around the sun", "Ocean currents", "Volcanic activity"],
      answer: 1,
      explanation: "Earth's axial tilt causes different parts of the Earth to receive varying amounts of sunlight throughout the year, leading to the seasons."
    }
  ]
};

// --- Configure Gemini (client-side) ---
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-pro:generateMessage"; // adjust if needed
const GEMINI_API_KEY = "AIzaSyCgS2lM-aRzDD9Pkq5OjGM6iCeW_dAeoM0"; // <-- PASTE YOUR KEY HERE (exposes key in browser)
const CORS_PROXY = "https://corsproxy.io/?"; // dev-only; may rate-limit

// helper: shuffle (Fisher-Yates)
const shuffleArray = <T,>(arr: T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// preserve correct index while shuffling options
const randomizeQuestionOptions = (q: { question: string; options: string[]; answer: number; explanation?: string; }) => {
  const indexed = q.options.map((opt, i) => ({ opt, i }));
  const shuffled = shuffleArray(indexed);
  const newOptions = shuffled.map((s) => s.opt);
  const newAnswer = shuffled.findIndex((s) => s.i === q.answer);
  return {
    question: q.question,
    options: newOptions,
    answer: newAnswer >= 0 ? newAnswer : 0,
    explanation: q.explanation || ""
  };
};

// extract text from common Gemini response shapes
const extractText = (resp: any) => {
  if (!resp) return "";
  const cand = resp?.candidates?.[0] ?? resp?.candidates?.[0];
  if (cand) {
    if (Array.isArray(cand?.message?.content)) return cand.message.content.map((c: any) => c.text || c.content || "").join("");
    if (Array.isArray(cand?.content)) return cand.content.map((c: any) => c.text || c.content || "").join("");
    if (typeof cand.output === "string") return cand.output;
  }
  if (Array.isArray(resp?.output?.[0]?.content)) return resp.output[0].content.map((c: any) => c.text || c.content || "").join("");
  if (typeof resp?.text === "string") return resp.text;
  return JSON.stringify(resp);
};

const tryParseQuestions = (text: string): { question: string; options: string[]; answer: number; explanation?: string }[] | null => {
  if (!text || typeof text !== "string") return null;

  // 1) Direct parse
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && Array.isArray(parsed.questions)) {
      return parsed.questions;
    }
  } catch {
    // ignore
  }

  // 2) Try to find a JSON object/array substring inside the text (useful when model adds commentary)
  const m = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (m && m[0]) {
    try {
      const parsedInner = JSON.parse(m[0]);
      if (Array.isArray(parsedInner)) return parsedInner;
      if (parsedInner && Array.isArray(parsedInner.questions)) return parsedInner.questions;
    } catch {
      // ignore
    }
  }

  // 3) Try to recover loosely formatted "questions:" style objects (best-effort) — not exhaustive
  // If nothing found, return null to trigger fallback logic in caller.
  return null;
};


// call Gemini directly from browser
async function callGeminiForJson(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error("Set GEMINI_API_KEY in the file");
  const payload = {
    messages: [
      { author: "system", content: [{ type: "text", text: "You are a strict JSON-only quiz generator." }] },
      { author: "user", content: [{ type: "text", text: prompt }] }
    ],
    temperature: 0.2,
    maxOutputTokens: 800
  };

  const url = `${CORS_PROXY}${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Model call failed: ${res.status} ${text.slice(0,300)}`);

  let parsedResp: any = null;
  try { parsedResp = JSON.parse(text); } catch { parsedResp = text; }

  const aiText = extractText(parsedResp) || (typeof parsedResp === "string" ? parsedResp : JSON.stringify(parsedResp));
  return aiText;
}

// save JSON to disk using File System Access API (user chooses file) or fallback to download
async function saveJsonToFile(jsonObj: any, suggestedName = "easy.json") {
  const jsonText = JSON.stringify(jsonObj, null, 2);
  // try File System Access API
  // @ts-ignore
  if (window.showSaveFilePicker) {
    try {
      // @ts-ignore
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      return { saved: true, method: "fs" };
    } catch (err) {
      // fallback to download
    }
  }

  // fallback: download link
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { saved: true, method: "download" };
}

// Integrate into AiQuiz.handleGenerate: for classes 5-8 call Gemini, validate JSON, save, and load into state
export default function AiQuiz() {
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"ai" | "mock" | "dataset" | null>(null);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [apiNote, setApiNote] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);

  const determineDifficulty = (cls: number) => {
    if (cls >= 5 && cls <= 8) return "easy";
    if (cls === 9 || cls === 10) return "medium";
    return "hard";
  };

  // load a built-in mock quiz from the in-memory QUIZES (used as fallback)
  const loadMock = (difficulty: string, note?: string) => {
    try {
      // easy -> prefer external easy.json, but fall back to in-memory MOCK_QUIZZES.easy if missing/empty
      let arr: Question[] = [];
      if (difficulty === "easy") {
        const rawFromFile: any[] = Array.isArray(easyJson) && (easyJson as any).length ? (easyJson as any) : [];
        const rawArr = rawFromFile.length ? rawFromFile : (MOCK_QUIZZES.easy ?? []);
        arr = rawArr.map((q: any, i: number) => ({
          question: String(q.question ?? q.q ?? `Question ${i + 1}`),
          options: Array.isArray(q.options) && q.options.length ? q.options.slice(0, 4).map(String) : ["Option A", "Option B", "Option C", "Option D"],
          answer: Number.isFinite(q.answer) ? Math.min(Math.max(Number(q.answer), 0), 3) : 0,
          explanation: String(q.explanation ?? "")
        }));
      } else if (difficulty === "medium") {
        const rawFromFile: any[] = Array.isArray(mediumJson) && (mediumJson as any).length ? (mediumJson as any) : [];
        const rawArr = rawFromFile.length ? rawFromFile : (MOCK_QUIZZES.medium ?? []);
        arr = rawArr.map((q: any, i: number) => ({
          question: String(q.question ?? q.q ?? `Question ${i + 1}`),
          options: Array.isArray(q.options) && q.options.length ? q.options.slice(0, 4).map(String) : ["Option A", "Option B", "Option C", "Option D"],
          answer: Number.isFinite(q.answer) ? Math.min(Math.max(Number(q.answer), 0), 3) : 0,
          explanation: String(q.explanation ?? "")
        }));
      } else if (difficulty === "hard") {
        const rawFromFile: any[] = Array.isArray(hardJson) && (hardJson as any).length ? (hardJson as any) : [];
        const rawArr = rawFromFile.length ? rawFromFile : (MOCK_QUIZZES.hard ?? []);
        arr = rawArr.map((q: any, i: number) => ({
          question: String(q.question ?? q.q ?? `Question ${i + 1}`),
          options: Array.isArray(q.options) && q.options.length ? q.options.slice(0, 4).map(String) : ["Option A", "Option B", "Option C", "Option D"],
          answer: Number.isFinite(q.answer) ? Math.min(Math.max(Number(q.answer), 0), 3) : 0,
          explanation: String(q.explanation ?? "")
        }));
      } else if (difficulty === "extreme") {
        // Other / Higher -> use extreme.json, fallback to hard mock
        const rawFromFile: any[] = Array.isArray(extremeJson) && (extremeJson as any).length ? (extremeJson as any) : [];
        const rawArr = rawFromFile.length ? rawFromFile : (MOCK_QUIZZES.extreme ?? MOCK_QUIZZES.hard ?? []);
        arr = rawArr.map((q: any, i: number) => ({
          question: String(q.question ?? q.q ?? `Question ${i + 1}`),
          options: Array.isArray(q.options) && q.options.length ? q.options.slice(0, 4).map(String) : ["Option A", "Option B", "Option C", "Option D"],
          answer: Number.isFinite(q.answer) ? Math.min(Math.max(Number(q.answer), 0), 3) : 0,
          explanation: String(q.explanation ?? "")
        }));
      } else {
        const src = (MOCK_QUIZZES as Record<string, Question[]>)[difficulty] ?? MOCK_QUIZZES["medium"];
        arr = src.map((q) => ({
          question: String(q.question || ""),
          options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : ["Option A", "Option B", "Option C", "Option D"],
          answer: Number.isFinite(q.answer) ? Math.min(Math.max(Number(q.answer), 0), 3) : 0,
          explanation: String(q.explanation ?? "")
        }));
      }

      // Ensure exactly 10 questions for every generated quiz.
      const desiredCount = 10;
      if (!arr.length) {
        throw new Error("No questions available to generate quiz.");
      }
      const pool = shuffleArray(arr);
      const sampled: Question[] = [];
      // cycle through shuffled pool until we have desiredCount entries (duplicates allowed)
      for (let i = 0; i < desiredCount; i++) {
        const item = pool[i % pool.length];
        // clone and randomize options while preserving correct answer index
        sampled.push(randomizeQuestionOptions(item));
      }

      setQuestions(sampled);
      setSource("mock");
      setRawResult(`Loaded ${sampled.length} ${difficulty} questions (10 total)`);
       setApiNote(note ?? null);
       setError(null);
       setAnswers({});
       setScore(null);
     } catch (err: any) {
       setError(String(err?.message || "Failed to load questions"));
     } finally {
       setLoading(false);
     }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQuestions(null);
    if (!selectedClass) { setError("Please select your class."); return; }
    const cls = Number(selectedClass);

    setLoading(true);
    try {
      // easy: load from easy.json; medium/hard: use in-memory mock arrays
      if (cls >= 5 && cls <= 8) {
        loadMock("easy");
        return;
      }
      if (cls === 9 || cls === 10) {
        loadMock("medium");
        return;
      }
      // class 11-12 -> hard, class 13 (Other / Higher) -> extreme
      if (cls === 13) {
        loadMock("extreme");
        return;
      }
      if (cls >= 11) {
        loadMock("hard");
        return;
      }
    } finally {
      setLoading(false);
    }
  };
 
  const selectOption = (qIndex: number, optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const submitAnswers = () => {
    if (!questions) return;
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    let s = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) s++;
    });
    setScore(s);
  };

  // add synthesize function (local generation, no network)
  const synthesizeFromEasy = (easyArr: any[], count = 5) => {
    const shuffle = <T,>(a: T[]) => {
      const b = a.slice();
      for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
      }
      return b;
    };

    const synonyms: Record<string, string[]> = {
      plant: ["plant", "vegetation"],
      tree: ["tree", "sapling"],
      water: ["water", "freshwater"],
      river: ["river", "stream"],
      ocean: ["ocean", "sea"],
      climate: ["climate", "weather patterns"]
    };

    const normalized = easyArr.map((q: any, i: number) => ({
      question: String(q.question ?? q.q ?? `Question ${i + 1}`),
      options:
        Array.isArray(q.options) && q.options.length
          ? q.options.slice(0, 4).map(String)
          : ["Option A", "Option B", "Option C", "Option D"],
      answer: Number.isFinite(q.answer) ? Number(q.answer) : 0,
      explanation: String(q.explanation ?? "")
    }));

    if (!normalized.length) return [];

    const pool = shuffle(normalized);
    const out: any[] = [];

    for (let k = 0; k < Math.min(count, pool.length); k++) {
      const src = pool[k % pool.length];
      let qtext = src.question;

      // minor local paraphrase: replace 1 word with a synonym sometimes
      for (const key of Object.keys(synonyms)) {
        if (Math.random() < 0.35 && qtext.toLowerCase().includes(key)) {
          const opts = synonyms[key];
          qtext = qtext.replace(new RegExp(key, "i"), opts[Math.floor(Math.random() * opts.length)]);
          break;
        }
      }

      // append small random tag to make it look new
      if (Math.random() < 0.4) qtext = `${qtext} (${Math.floor(Math.random() * 90 + 10)})`;

      // shuffle options while preserving correct index
            const indexed: { o: string; i: number }[] = src.options.map((o: string, i: number) => ({ o, i }));
            const shuffled = shuffle(indexed);
            const newOptions = shuffled.map((s) => s.o);
            const newAnswer = shuffled.findIndex((s) => s.i === src.answer);

      out.push({
        question: qtext,
        options: newOptions,
        answer: newAnswer >= 0 ? newAnswer : 0,
        explanation: src.explanation
      });
    }

    return out;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Quiz Generator</CardTitle>
            <p className="text-sm text-muted-foreground">Select your class and generate environment & geography quizzes.</p>
            {source === "ai" && <div className="mt-2 text-sm text-green-700">Generated by AI</div>}
            {source === "mock" && <div className="mt-2 text-sm text-yellow-800">{apiNote ? ` — ${apiNote}` : ""}</div>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Class (Grade)</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : "")}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="">Select class</option>
                  {Array.from({ length: 8 }, (_, i) => i + 5).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  <option value={13}>Other / Higher</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="eco" disabled={loading}>
                  {loading ? "Generating..." : "Generate Quiz"}
                </Button>
                 <Button type="button" variant="outline" onClick={() => { setRawResult(null); setError(null); setQuestions(null); setAnswers({}); setScore(null); setSource(null); setApiNote(null); }}>
                   Clear
                 </Button>
               </div>
             </form>

            {error && <div className="mt-4 text-red-600">{error}</div>}

            {rawResult && !questions && (
              <div className="mt-6 p-4 bg-card rounded-md whitespace-pre-wrap">
                <h4 className="font-semibold mb-2">Raw AI Response</h4>
                <div>{rawResult}</div>
              </div>
            )}

            {questions && (
              <div className="mt-6 p-4 bg-card rounded-md">
                <h4 className="font-semibold mb-2">Quiz</h4>
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={i} className="p-3 border rounded">
                      <div className="font-medium">{i + 1}. {q.question}</div>
                      <div className="mt-2 space-y-2">
                        {q.options.map((opt, oi) => {
                          const selected = answers[i] === oi;

                          const optionClass = (() => {
                            let base = "w-full text-left p-2 border rounded bg-background";
                            if (score !== null) {
                              const correctIndex = q.answer;
                              if (oi === correctIndex) return `${base} border-green-500 bg-green-50`;
                              if (selected && oi !== correctIndex) return `${base} border-red-500 bg-red-50`;
                              return `${base} border-neutral-200`;
                            }
                            if (selected) return `${base} border-primary bg-primary/10`;
                            return base;
                          })();

                          return (
                            <button
                              key={oi}
                              onClick={() => selectOption(i, oi)}
                              className={optionClass}
                              type="button"
                              aria-pressed={selected}
                            >
                              <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                            </button>
                          );
                        })}
                      </div>
                      {score !== null && (
                        <div className="mt-2 text-sm">
                          <div>Correct answer: <strong>{String.fromCharCode(65 + q.answer)}</strong></div>
                          {q.explanation && <div className="text-muted-foreground mt-1">Explanation: {q.explanation}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="eco"
                    onClick={submitAnswers}
                    disabled={!questions || Object.keys(answers).length !== questions.length || score !== null}
                  >
                    Submit Answers
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setQuestions(null); setAnswers({}); setScore(null); setSource(null); setApiNote(null); }}>Generate New</Button>
                </div>

                {score !== null && (
                  <div className="mt-4">
    <strong>Score: {score} / 10</strong>
    {score === questions.length && (
      <div className="text-green-700 font-bold mt-2">Congratulations! You scored a perfect 10/10!</div>
    )}
  </div>
                 )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}