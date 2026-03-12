import os
import json
import tempfile
import requests
from urllib.parse import urlparse, parse_qs
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from rag import process_pdf, get_context
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)

app = Flask(__name__)
_cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
CORS(app, origins=_cors_origins)

# Whisper loaded lazily on first /transcribe request (avoids RAM spike at startup)
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
    return _whisper_model

pdf_text = None

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.0-flash-001"


# ─── YouTube helpers ────────────────────────────────────────

def extract_video_id(url: str) -> str | None:
    """Extract the YouTube video ID from various URL formats."""
    parsed = urlparse(url)
    host = parsed.hostname or ""

    if host in ("www.youtube.com", "youtube.com", "m.youtube.com"):
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]
        if parsed.path.startswith(("/embed/", "/v/")):
            return parsed.path.split("/")[2] if len(parsed.path.split("/")) > 2 else None
        if parsed.path.startswith("/shorts/"):
            return parsed.path.split("/")[2] if len(parsed.path.split("/")) > 2 else None
    if host in ("youtu.be",):
        return parsed.path.lstrip("/").split("/")[0] or None

    return None


def get_youtube_transcript(url: str) -> str:
    """Extract transcript text from a YouTube video URL."""
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL — could not extract video ID.")

    ytt = YouTubeTranscriptApi()
    transcript = ytt.fetch(video_id)
    text = " ".join(snippet.text for snippet in transcript.snippets)
    return text


# ─── OpenRouter / Gemini helper ─────────────────────────────

def call_gemini_json(system_prompt: str, user_prompt: str) -> dict:
    """Call OpenRouter (Gemini) and return parsed JSON."""
    res = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    res.raise_for_status()
    content = res.json()["choices"][0]["message"]["content"]
    return json.loads(content)


def call_gemini_text(system_prompt: str, user_prompt: str) -> str:
    """Call OpenRouter (Gemini) and return plain text."""
    res = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        },
        timeout=120,
    )
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


# ─── Routes ─────────────────────────────────────────────────

@app.route("/")
def home():
    return "EduMind AI Backend Running 🚀"


@app.route("/upload", methods=["POST"])
def upload():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided."}), 400
    fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        os.close(fd)
        file.save(tmp_path)
        global pdf_text
        pdf_text = process_pdf(tmp_path)
        return jsonify({"message": "PDF processed successfully"})
    except Exception as e:
        return jsonify({"error": f"PDF processing failed: {str(e)}"}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.route("/ask", methods=["POST"])
def ask():
    if pdf_text is None:
        return jsonify({"error": "No PDF uploaded yet."}), 400
    question = (request.json or {}).get("question", "").strip()
    if not question:
        return jsonify({"error": "Question is required."}), 400
    context = get_context(pdf_text, question)
    try:
        answer = call_gemini_text(
            "You are an AI study assistant. Answer the student's question based only on "
            "the provided document content. Be clear and concise. Use markdown (bullet points, "
            "bold) where helpful. If the answer is not in the document, say so.",
            f'Document content:\n"""\n{context}\n"""\n\nQuestion: {question}',
        )
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": f"AI answer failed: {str(e)}"}), 500


@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    url = (data or {}).get("url", "").strip()

    if not url:
        return jsonify({"error": "URL is required."}), 400

    # Step 1: Try to extract YouTube transcript
    video_id = extract_video_id(url)

    if video_id:
        try:
            transcript = get_youtube_transcript(url)
        except VideoUnavailable:
            return jsonify({
                "error": "This video is unavailable or has been removed."
            }), 422
        except TranscriptsDisabled:
            return jsonify({
                "error": "Transcripts/captions are disabled for this video."
            }), 422
        except NoTranscriptFound:
            return jsonify({
                "error": "No transcript found for this video. It may not have captions."
            }), 422
        except Exception as e:
            return jsonify({
                "error": f"Could not fetch transcript: {str(e)}"
            }), 422
    else:
        # Non-YouTube URL — pass URL directly so Gemini can infer the topic
        transcript = None

    # Step 2: Generate quiz via Gemini
    system_prompt = (
        "You are an AI quiz generator. Return JSON with this exact structure:\n"
        '{"mcqs":[{"id":1,"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"explanation":"..."}],'
        '"flashcards":[{"front":"...","back":"..."}],'
        '"shortAnswers":[{"question":"...","answer":"..."}]}\n'
        "Generate exactly 5 MCQs, 5 flashcards, and 3 short answer questions. Varied difficulty."
    )

    if transcript:
        user_prompt = (
            "Generate 10 multiple choice quiz questions from this lecture transcript. "
            "Each question should include 4 options and indicate the correct answer.\n\n"
            f'"""\n{transcript[:15000]}\n"""'
        )
    else:
        user_prompt = f"Generate a quiz based on the content at this URL: {url}"

    try:
        quiz = call_gemini_json(system_prompt, user_prompt)
        return jsonify(quiz)
    except Exception as e:
        return jsonify({"error": f"AI generation failed: {str(e)}"}), 500


@app.route("/transcribe", methods=["POST"])
def transcribe():
    """Accept an audio file and return its transcript using faster-whisper."""
    if "file" not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    audio_file = request.files["file"]
    if not audio_file.filename:
        return jsonify({"error": "Empty filename."}), 400

    suffix = os.path.splitext(audio_file.filename)[1] or ".wav"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    try:
        os.close(fd)
        audio_file.save(tmp_path)
        model = get_whisper_model()
        segments, _ = model.transcribe(tmp_path, beam_size=1)
        transcript_text = " ".join(seg.text for seg in segments).strip()
        if not transcript_text:
            return jsonify({"error": "Could not extract any speech from the audio."}), 422
        return jsonify({"transcript": transcript_text})
    except Exception as e:
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, use_reloader=False, host="0.0.0.0", port=port)
