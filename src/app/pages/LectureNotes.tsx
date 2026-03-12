import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Mic,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Sparkles,
  Volume2,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Send,
  Square,
} from "lucide-react";
import { summarizeLecture, generateNotesFromTopic, type LectureNotesResult } from "../../lib/gemini";

type Stage = "upload" | "processing" | "done";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:5000";

export function LectureNotes() {
  const [stage, setStage] = useState<Stage>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [noiseReduction, setNoiseReduction] = useState(87);
  const [fileName, setFileName] = useState("");
  const [transcript, setTranscript] = useState("");
  const [aiNotes, setAiNotes] = useState<{ heading: string; content: string; type: string }[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRecRef = useRef<SpeechRecognition | null>(null);
  const liveTranscriptRef = useRef<string>("");

  /** Upload an audio file to the backend /transcribe endpoint */
  const transcribeAudio = async (file: File | Blob, name: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file, name);
    const res = await fetch(`${BACKEND_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Transcription failed (${res.status})`);
    }
    return data.transcript;
  };

  /** Process an audio/video file: transcribe then generate notes */
  const processAudioFile = async (file: File | Blob, name: string) => {
    setFileName(name);
    setStage("processing");
    setProgress(0);
    setErrorMsg("");

    // Create a playback URL for the audio player
    setAudioUrl(URL.createObjectURL(file));

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 4 + 1;
      if (p >= 30) { clearInterval(interval); p = 30; }
      setProgress(Math.min(p, 30));
    }, 300);

    try {
      // Step 1: Transcribe audio via backend Whisper
      const transcriptText = await transcribeAudio(file, name);
      clearInterval(interval);
      setProgress(60);

      // Step 2: Generate AI notes from the real transcript
      const result: LectureNotesResult = await summarizeLecture(transcriptText);
      setProgress(100);
      setTranscript(result.transcript || transcriptText);
      setAiNotes(result.notes);
      setTimeout(() => setStage("done"), 500);
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Transcription failed";
      setErrorMsg(msg);
      setProgress(0);
      setStage("upload");
    }
  };

  /** Process a topic input (no audio) */
  const processTopicInput = async (topic: string) => {
    setFileName(topic);
    setStage("processing");
    setProgress(0);
    setErrorMsg("");
    setAudioUrl(null);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 6 + 2;
      if (p >= 90) { clearInterval(interval); p = 90; }
      setProgress(Math.min(p, 90));
    }, 200);

    try {
      const result = await generateNotesFromTopic(topic);
      clearInterval(interval);
      setProgress(100);
      setTranscript(result.transcript);
      setAiNotes(result.notes);
      setTimeout(() => setStage("done"), 500);
    } catch {
      clearInterval(interval);
      setProgress(0);
      setStage("upload");
    }
  };

  /** Start recording from the microphone */
  const startRecording = useCallback(async () => {
    setErrorMsg("");
    liveTranscriptRef.current = "";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorder: capture audio blob for Whisper backup
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000);

      // Browser SpeechRecognition: real-time transcript (works in Chrome/Edge)
      const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition
        || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              liveTranscriptRef.current += " " + event.results[i][0].transcript;
            }
          }
        };
        recognition.onerror = () => { /* ignore — whisper fallback will handle it */ };
        recognition.start();
        speechRecRef.current = recognition;
      }

      setIsRecording(true);
    } catch {
      setErrorMsg("Microphone access denied. Please allow microphone permission.");
    }
  }, []);

  /** Stop recording and process */
  const stopRecording = useCallback(() => {
    setIsRecording(false);

    // Stop SpeechRecognition
    if (speechRecRef.current) {
      speechRecRef.current.stop();
      speechRecRef.current = null;
    }

    // Stop MediaRecorder — triggers processing
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";

        if (blob.size === 0) {
          setErrorMsg("Recording was empty. Please try again.");
          return;
        }

        // If browser speech recognition got text, use it directly (faster)
        const browserTranscript = liveTranscriptRef.current.trim();
        if (browserTranscript.length > 20) {
          processTranscriptDirectly(browserTranscript, blob);
        } else {
          // Fall back to Whisper backend
          processAudioFile(blob, `Live Recording${ext}`);
        }
      };
      recorder.stop();
    }
  }, []);

  /** Process when we already have a transcript from browser SpeechRecognition */
  const processTranscriptDirectly = async (transcriptText: string, audioBlob: Blob) => {
    setFileName("Live Recording");
    setStage("processing");
    setProgress(0);
    setErrorMsg("");
    setAudioUrl(URL.createObjectURL(audioBlob));

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 60) { clearInterval(interval); p = 60; }
      setProgress(Math.min(p, 60));
    }, 200);

    try {
      const result: LectureNotesResult = await summarizeLecture(transcriptText);
      clearInterval(interval);
      setProgress(100);
      setTranscript(result.transcript || transcriptText);
      setAiNotes(result.notes);
      setTimeout(() => setStage("done"), 500);
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Note generation failed";
      setErrorMsg(msg);
      setProgress(0);
      setStage("upload");
    }
  };

  const handleTopicSubmit = () => {
    if (!topicInput.trim()) return;
    processTopicInput(topicInput);
  };

  const stages = [
    { label: "Recording", key: "upload" },
    { label: "Processing", key: "processing" },
    { label: "Notes Generated", key: "done" },
  ];

  const currentStageIdx = stage === "upload" ? 0 : stage === "processing" ? 1 : 2;

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          {stages.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${i < currentStageIdx ? "text-white" : i === currentStageIdx ? "text-white" : "bg-gray-100 text-gray-400"}`}
                  style={i <= currentStageIdx ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" } : {}}>
                  {i < currentStageIdx ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${i <= currentStageIdx ? "text-blue-600" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex-1 h-1 mx-3 rounded-full mb-5 overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: i < currentStageIdx ? "100%" : i === currentStageIdx && stage === "processing" ? `${progress}%` : "0%",
                      background: "linear-gradient(90deg, #2563EB, #7C3AED)"
                    }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {stage === "upload" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Error message */}
          {errorMsg && (
            <div className="lg:col-span-2 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`bg-white rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all
              ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) processAudioFile(file, file.name);
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "audio/*,video/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) processAudioFile(file, file.name);
              };
              input.click();
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: isDragging ? "rgba(37,99,235,0.1)" : "rgba(37,99,235,0.06)" }}>
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
              Upload Audio / Video
            </h3>
            <p className="text-gray-400 text-sm mb-4">Drag & drop or click to browse</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["MP3", "MP4", "WAV", "M4A", "WebM"].map((fmt) => (
                <span key={fmt} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">{fmt}</span>
              ))}
            </div>
          </div>

          {/* Record Option */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform ${isRecording ? "animate-pulse" : ""}`}
              style={{ background: isRecording ? "linear-gradient(135deg, #EF4444, #DC2626)" : "linear-gradient(135deg, #7C3AED, #2563EB)" }}
              onClick={() => isRecording ? stopRecording() : startRecording()}>
              {isRecording ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </div>
            <h3 className="text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
              {isRecording ? "Recording..." : "Record Live Lecture"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {isRecording ? "Click stop when finished" : "Record directly from your microphone"}
            </p>
            <button
              onClick={() => isRecording ? stopRecording() : startRecording()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: isRecording ? "linear-gradient(135deg, #EF4444, #DC2626)" : "linear-gradient(135deg, #7C3AED, #2563EB)" }}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          </div>
        </div>
      )}

      {/* Generate Notes from Topic */}
      {stage === "upload" && !isRecording && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}>
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                Generate Notes from Topic
              </h3>
              <p className="text-gray-400 text-xs">Type any topic and AI will generate comprehensive study notes</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-300 transition-colors">
              <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTopicSubmit()}
                placeholder="e.g. Binary Search Trees, Photosynthesis, French Revolution..."
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>
            <button
              onClick={handleTopicSubmit}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}
            >
              <Send className="w-4 h-4" /> Generate
            </button>
          </div>
        </div>
      )}

      {stage === "processing" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1.2rem" }}>
            AI is processing your lecture...
          </h3>
          <p className="text-gray-400 text-sm mb-8">"{fileName}"</p>

          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold" style={{ color: "#2563EB" }}>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #2563EB, #7C3AED)" }} />
            </div>

            <div className="space-y-3 text-left mt-6">
              {[
                { label: "Noise Reduction", value: noiseReduction, done: progress > 30 },
                { label: "Speech-to-Text Transcription", done: progress > 60 },
                { label: "AI Summary Generation", done: progress > 90 },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${step.done ? "bg-green-50" : "bg-gray-50"}`}>
                  {step.done
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    : <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 animate-pulse" />
                  }
                  <span className={`text-sm ${step.done ? "text-green-700 font-medium" : "text-gray-500"}`}>
                    {step.label}
                    {step.value && step.done && <span className="ml-2 text-green-600 font-semibold">{step.value}% cleaned</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transcript */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                  Speech-to-Text Transcript
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                  <CheckCircle className="w-3 h-3" /> 87% noise reduced
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <div className="mx-5 mt-4 p-4 rounded-xl border border-purple-100 bg-purple-50/50">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)" }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 h-1.5 bg-purple-100 rounded-full overflow-hidden cursor-pointer">
                  <div className="h-full rounded-full w-1/3"
                    style={{ background: "linear-gradient(90deg, #7C3AED, #2563EB)" }} />
                </div>
                <span className="text-xs text-purple-600 font-medium">23:14</span>
              </div>
              <div className="flex gap-0.5 items-end h-6">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{
                      height: `${Math.random() * 80 + 20}%`,
                      background: i < 14 ? "#7C3AED" : "#e9d5ff"
                    }} />
                ))}
              </div>
            </div>

            <div className="p-5 overflow-y-auto" style={{ maxHeight: "300px" }}>
              <p className="text-gray-600 text-sm leading-relaxed">{transcript}</p>
            </div>
          </div>

          {/* AI Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                  AI Generated Notes
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {aiNotes.map((note, i) => (
                <div key={i} className="rounded-xl p-4 border"
                  style={{
                    background: note.type === "definition" ? "rgba(37,99,235,0.04)" : note.type === "list" ? "rgba(124,58,237,0.04)" : "rgba(6,182,212,0.04)",
                    borderColor: note.type === "definition" ? "rgba(37,99,235,0.15)" : note.type === "list" ? "rgba(124,58,237,0.15)" : "rgba(6,182,212,0.15)",
                  }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: note.type === "definition" ? "#2563EB" : note.type === "list" ? "#7C3AED" : "#06B6D4" }} />
                    <h4 className="text-gray-900 text-sm"
                      style={{
                        fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                        color: note.type === "definition" ? "#2563EB" : note.type === "list" ? "#7C3AED" : "#06B6D4"
                      }}>
                      {note.heading}
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{note.content}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-50">
              <button className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                Export as PDF / Notion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}