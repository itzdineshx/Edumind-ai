// This file is kept for backward compatibility.
// PDF Q&A now uses the Flask backend via src/services/pdfAI.ts.
// Other AI features use OpenRouter.

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

async function chat(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function chatJson<T>(messages: { role: string; content: string }[]): Promise<T> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text);
}

// ─── PDF Q&A ───────────────────────────────────────────────
export async function askPdfQuestion(pdfText: string, question: string): Promise<string> {
  return chat([
    {
      role: "system",
      content: "You are an AI study assistant. Answer the student's question based only on the provided document content. Be clear and concise. Use bullet points or bold text (markdown) where helpful. If the answer is not in the document, say so.",
    },
    {
      role: "user",
      content: `Document content:\n"""\n${pdfText}\n"""\n\nQuestion: ${question}`,
    },
  ]);
}

// ─── Quiz Generation from Topic/Content ────────────────────
export interface GeneratedQuiz {
  mcqs: { id: number; question: string; options: string[]; correct: number; explanation: string }[];
  flashcards: { front: string; back: string }[];
  shortAnswers: { question: string; answer: string }[];
}

export async function generateQuizFromContent(content: string): Promise<GeneratedQuiz> {
  return chatJson<GeneratedQuiz>([
    {
      role: "system",
      content: `You are an AI quiz generator. Return JSON with this exact structure:
{"mcqs":[{"id":1,"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"explanation":"..."}],"flashcards":[{"front":"...","back":"..."}],"shortAnswers":[{"question":"...","answer":"..."}]}
Generate exactly 5 MCQs, 5 flashcards, and 3 short answer questions. Varied difficulty.`,
    },
    { role: "user", content: `Generate a quiz from this content:\n"""\n${content}\n"""` },
  ]);
}

// ─── Quiz Generation from URL ──────────────────────────────
export async function generateQuizFromUrl(url: string): Promise<GeneratedQuiz> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:5000";
  const res = await fetch(`${backendUrl}/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Backend error (${res.status})`);
  }
  // Ensure structure has all required fields
  return {
    mcqs: data.mcqs ?? [],
    flashcards: data.flashcards ?? [],
    shortAnswers: data.shortAnswers ?? [],
  };
}

// ─── Lecture Summarization ─────────────────────────────────
export interface LectureNotesResult {
  transcript: string;
  notes: { heading: string; content: string; type: "definition" | "list" | "concept" }[];
}

export async function summarizeLecture(audioTranscript: string): Promise<LectureNotesResult> {
  return chatJson<LectureNotesResult>([
    {
      role: "system",
      content: `You are an AI study assistant. Generate structured study notes from a lecture transcript. Return JSON:
{"transcript":"Cleaned-up readable transcript...","notes":[{"heading":"...","content":"...","type":"definition|list|concept"}]}
Generate at least 5 notes. Types: "definition" for definitions, "list" for bullet-point summaries, "concept" for concept explanations.`,
    },
    { role: "user", content: `Summarize this lecture transcript:\n"""\n${audioTranscript}\n"""` },
  ]);
}

// ─── Generate Notes from Topic ─────────────────────────────
export async function generateNotesFromTopic(topic: string): Promise<LectureNotesResult> {
  return chatJson<LectureNotesResult>([
    {
      role: "system",
      content: `You are an AI study assistant. Generate comprehensive study notes on the given topic. Return JSON:
{"transcript":"A brief overview paragraph about the topic...","notes":[{"heading":"...","content":"...","type":"definition|list|concept"}]}
Generate at least 6 thorough notes covering definitions, key concepts, examples. Types: "definition", "list", "concept".`,
    },
    { role: "user", content: `Generate detailed study notes on: ${topic}` },
  ]);
}

// ─── Extract text from PDF file ────────────────────────────
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const raw = decoder.decode(bytes);

  // Try to extract readable text from PDF
  let text = "";
  const textMatches = raw.match(/\(([^)]+)\)/g);
  if (textMatches) {
    text = textMatches
      .map((m) => m.slice(1, -1))
      .filter((t) => t.length > 1 && /[a-zA-Z]/.test(t))
      .join(" ");
  }

  // If extraction yielded very little, ask AI to infer from filename
  if (text.trim().length < 50) {
    const fallback = await chat([
      {
        role: "system",
        content: "The user uploaded a PDF but text extraction failed. Based on the filename, provide a helpful message about what the document likely contains.",
      },
      {
        role: "user",
        content: `I uploaded a PDF called "${file.name}" but couldn't extract text. The raw content starts with: ${raw.slice(0, 500)}`,
      },
    ]);
    text = fallback;
  }

  return text;
}

// ─── Answer Exam Questions ──────────────────────────────
export async function answerExamQuestion(question: string, subject: string, marks: number): Promise<string> {
  return chat([
    {
      role: "system",
      content: `You are an expert university professor for ${subject} (Anna University, Regulation 2021). Provide a detailed, well-structured answer suitable for a ${marks}-mark exam question. Use headings, bullet points, and diagrams described in text where appropriate. Be thorough but concise — match the depth to the marks allocated.`,
    },
    {
      role: "user",
      content: `Answer this ${marks}-mark exam question:\n\n${question}`,
    },
  ]);
}
