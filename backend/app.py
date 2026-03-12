import re
import os
import json
import tempfile
import requests
from urllib.parse import urlparse, parse_qs
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from rag import process_pdf, search_pdf
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)

# Make bundled ffmpeg available to Whisper before importing it
import imageio_ffmpeg
import shutil

_ffmpeg_src = imageio_ffmpeg.get_ffmpeg_exe()
_ffmpeg_dir = os.path.dirname(_ffmpeg_src)
_ffmpeg_name = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
_ffmpeg_dst = os.path.join(_ffmpeg_dir, _ffmpeg_name)
if not os.path.exists(_ffmpeg_dst):
    shutil.copy2(_ffmpeg_src, _ffmpeg_dst)
    if os.name != "nt":
        os.chmod(_ffmpeg_dst, 0o755)
os.environ["PATH"] = _ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

import whisper

app = Flask(__name__)
_cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
CORS(app, origins=_cors_origins)

# Load Whisper model once at startup (use "base" for speed)
whisper_model = whisper.load_model("base")

db = None

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


# ─── Routes ─────────────────────────────────────────────────

@app.route("/")
def home():
    return "EduMind AI Backend Running 🚀"


@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["file"]
    fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        os.close(fd)
        file.save(tmp_path)
        global db
        db = process_pdf(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
    return jsonify({"message": "PDF processed successfully"})


@app.route("/ask", methods=["POST"])
def ask():
    question = request.json["question"]
    answer = search_pdf(db, question)
    return jsonify({"answer": answer})


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
    """Accept an audio file and return its transcript using Whisper."""
    if "file" not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    audio_file = request.files["file"]
    if not audio_file.filename:
        return jsonify({"error": "Empty filename."}), 400

    # Save to a temp file so Whisper can read it
    suffix = os.path.splitext(audio_file.filename)[1] or ".wav"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    try:
        os.close(fd)
        audio_file.save(tmp_path)
        result = whisper_model.transcribe(tmp_path)
        transcript_text = result.get("text", "").strip()
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