const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:5000";

interface UploadResponse {
  message: string;
}

interface AskResponse {
  answer: string;
}

export async function uploadPDF(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function askQuestion(question: string): Promise<string> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ask failed (${res.status}): ${text}`);
  }

  const data: AskResponse = await res.json();
  return data.answer;
}
