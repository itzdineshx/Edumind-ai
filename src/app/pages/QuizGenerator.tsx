import { useState } from "react";
import {
  Link,
  Zap,
  CheckCircle,
  RefreshCw,
  Youtube,
  Globe,
  Instagram,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { generateQuizFromUrl, type GeneratedQuiz } from "../../lib/gemini";

type Tab = "mcq" | "flashcard" | "shortanswer";

const mcqQuestions: {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}[] = [];

const flashcards: { front: string; back: string }[] = [];

const shortAnswers: { question: string; answer: string }[] = [];

const urlSuggestions = [
  { icon: Youtube, label: "YouTube Video", placeholder: "https://youtube.com/watch?v=...", color: "#FF0000" },
  { icon: Globe, label: "Blog / Article", placeholder: "https://medium.com/...", color: "#2563EB" },
  { icon: Instagram, label: "Educational Post", placeholder: "https://instagram.com/p/...", color: "#7C3AED" },
];

export function QuizGenerator() {
  const [url, setUrl] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("mcq");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [currentCard, setCurrentCard] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [quizData, setQuizData] = useState<GeneratedQuiz>({ mcqs: [], flashcards: [], shortAnswers: [] });
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!url.trim()) return;
    setIsGenerating(true);
    setIsGenerated(false);
    setGenerationProgress(0);
    setError("");
    setAnswers({});
    setRevealed({});
    setFlipped({});
    setCurrentCard(0);

    // Animate progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 90) {
        clearInterval(interval);
        p = 90;
      }
      setGenerationProgress(Math.min(p, 90));
    }, 200);

    try {
      const data = await generateQuizFromUrl(url);
      clearInterval(interval);
      setGenerationProgress(100);
      setQuizData(data);
      setTimeout(() => {
        setIsGenerating(false);
        setIsGenerated(true);
      }, 300);
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Quiz generation error:", err);
      setError(`Failed to generate quiz: ${msg}`);
    }
  };

  const mcqQuestions = quizData.mcqs;
  const flashcards = quizData.flashcards;
  const shortAnswers = quizData.shortAnswers;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "mcq", label: "MCQs", count: mcqQuestions.length },
    { key: "flashcard", label: "Flashcards", count: flashcards.length },
    { key: "shortanswer", label: "Short Answers", count: shortAnswers.length },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* URL Input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}>
            <Link className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
              URL to Quiz Generator
            </h3>
            <p className="text-gray-400 text-xs">Paste any educational URL to generate quiz questions</p>
          </div>
        </div>

        {/* Source Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {urlSuggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => { setSelectedType(s.label); setUrl(s.placeholder); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                ${selectedType === s.label ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"}`}
              style={selectedType === s.label ? { background: s.color } : {}}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* URL Input */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-cyan-300 transition-colors">
            <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Blog, or Article URL..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}
          >
            {isGenerating ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-4 h-4" /> Generate Quiz</>
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600">AI analyzing content...</span>
              <span className="font-semibold" style={{ color: "#06B6D4" }}>{Math.round(generationProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%`, background: "linear-gradient(90deg, #06B6D4, #2563EB)" }} />
            </div>
            <div className="flex gap-2 mt-3">
              {["Fetching content", "Understanding topics", "Generating questions"].map((step, i) => (
                <div key={i} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all
                  ${generationProgress > (i + 1) * 30 ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {generationProgress > (i + 1) * 30
                    ? <CheckCircle className="w-3 h-3" />
                    : <div className="w-3 h-3 rounded-full border border-current animate-pulse" />
                  }
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      {isGenerated && (
        <>
          {/* Tabs & Stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-gray-100 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${activeTab === tab.key ? "text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                  style={activeTab === tab.key ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" } : {}}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4" />
              {mcqQuestions.length + flashcards.length + shortAnswers.length} questions generated
            </div>
          </div>

          {/* MCQs Tab */}
          {activeTab === "mcq" && (
            <div className="space-y-4">
              {mcqQuestions.map((q, qi) => (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
                      {q.id}
                    </span>
                    <p className="text-gray-800 font-medium text-sm leading-relaxed">{q.question}</p>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect = oi === q.correct;
                      const hasAnswered = answers[qi] !== undefined;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                          disabled={hasAnswered}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all border
                            ${hasAnswered
                              ? isCorrect
                                ? "border-green-200 bg-green-50 text-green-800"
                                : isSelected
                                  ? "border-red-200 bg-red-50 text-red-800"
                                  : "border-gray-100 bg-gray-50 text-gray-500"
                              : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 text-gray-700"
                            }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${hasAnswered
                              ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                              : "bg-gray-100 text-gray-500"
                            }`}>
                            {hasAnswered
                              ? isCorrect ? <Check className="w-3 h-3" /> : isSelected ? <X className="w-3 h-3" /> : String.fromCharCode(65 + oi)
                              : String.fromCharCode(65 + oi)
                            }
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {answers[qi] !== undefined && (
                    <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-blue-700 text-xs font-semibold mb-1">💡 Explanation</p>
                      <p className="text-blue-600 text-sm">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === "flashcard" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Card {currentCard + 1} of {flashcards.length}</p>
                <div className="h-1.5 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%`, background: "linear-gradient(90deg, #06B6D4, #2563EB)" }} />
                </div>
              </div>
              <div
                className="cursor-pointer select-none"
                onClick={() => setFlipped(prev => ({ ...prev, [currentCard]: !prev[currentCard] }))}
                style={{ perspective: "1000px" }}
              >
                <div className={`relative transition-all duration-500 h-56`}
                  style={{ transformStyle: "preserve-3d", transform: flipped[currentCard] ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                  {/* Front */}
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-gray-100 shadow-sm bg-white"
                    style={{ backfaceVisibility: "hidden" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-900 font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {flashcards[currentCard].front}
                    </p>
                    <p className="text-gray-400 text-xs mt-3">Click to reveal answer</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-white"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}>
                    <p className="text-white font-medium leading-relaxed">{flashcards[currentCard].back}</p>
                    <p className="text-white/60 text-xs mt-3">Click to flip back</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setCurrentCard(c => Math.max(0, c - 1))} disabled={currentCard === 0}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <button onClick={() => setFlipped(prev => ({ ...prev, [currentCard]: false }))}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => setCurrentCard(c => Math.min(flashcards.length - 1, c + 1))} disabled={currentCard === flashcards.length - 1}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex justify-center gap-2">
                {flashcards.map((_, i) => (
                  <button key={i} onClick={() => setCurrentCard(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentCard ? "w-6" : "bg-gray-200"}`}
                    style={i === currentCard ? { background: "linear-gradient(90deg, #06B6D4, #2563EB)" } : {}} />
                ))}
              </div>
            </div>
          )}

          {/* Short Answers Tab */}
          {activeTab === "shortanswer" && (
            <div className="space-y-4">
              {shortAnswers.map((q, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-gray-800 font-medium text-sm mb-3">Q{i + 1}. {q.question}</p>
                  <textarea
                    placeholder="Type your answer here..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none resize-none focus:border-blue-300 transition-colors"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ color: "#2563EB", background: "rgba(37,99,235,0.08)" }}
                    >
                      {revealed[i] ? "Hide Answer" : "Show Answer"}
                    </button>
                  </div>
                  {revealed[i] && (
                    <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <p className="text-green-700 text-xs font-semibold mb-1">✅ Model Answer</p>
                      <p className="text-green-700 text-sm">{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
