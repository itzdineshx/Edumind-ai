import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw,
  TrendingUp,
  Brain,
  Target,
  Zap,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import { generateQuizFromContent } from "../../lib/gemini";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  subject: string;
}

type TestPhase = "intro" | "loading" | "active" | "result";

const DEFAULT_TOPICS = [
  "Stacks & Queues",
  "Sorting Algorithms",
  "BST",
  "Graph Algorithms",
  "Space Complexity",
];

export function SelfTest() {
  const [phase, setPhase] = useState<TestPhase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [topicInput, setTopicInput] = useState("Data Structures");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([...DEFAULT_TOPICS]);
  const [errorMsg, setErrorMsg] = useState("");

  /** Generate questions from AI */
  const generateQuestions = async () => {
    setPhase("loading");
    setErrorMsg("");
    try {
      const topicStr = selectedTopics.length > 0
        ? `${topicInput} covering: ${selectedTopics.join(", ")}`
        : topicInput;

      const quiz = await generateQuizFromContent(
        `Generate a self-test on ${topicStr}. Create 10 multiple-choice questions with varied difficulty.`
      );

      const qs: Question[] = quiz.mcqs.map((m, i) => ({
        id: i + 1,
        question: m.question,
        options: m.options.map((o) => o.replace(/^[A-D]\)\s*/, "")),
        correct: m.correct,
        subject: topicInput,
      }));

      if (qs.length === 0) {
        setErrorMsg("AI returned no questions. Please try again.");
        setPhase("intro");
        return;
      }

      setQuestions(qs);
      setCurrentQ(0);
      setAnswers({});
      setSelectedOption(null);
      setShowFeedback(false);
      setTimeLeft(30 * 60);
      setPhase("active");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate questions";
      setErrorMsg(msg);
      setPhase("intro");
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  useEffect(() => {
    if (phase !== "active") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const score = questions.filter((q) => answers[q.id] === q.correct).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const timeUsed = 30 * 60 - timeLeft;

  const handleSelect = (optIdx: number) => {
    if (showFeedback) return;
    setSelectedOption(optIdx);
    setShowFeedback(true);
    setAnswers((prev) => ({ ...prev, [questions[currentQ].id]: optIdx }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setPhase("result");
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1);
      setSelectedOption(answers[questions[currentQ - 1].id] ?? null);
      setShowFeedback(true);
    }
  };

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "#10B981", label: "Excellent!" };
    if (percentage >= 75) return { grade: "A", color: "#2563EB", label: "Great Job!" };
    if (percentage >= 60) return { grade: "B", color: "#7C3AED", label: "Good Work!" };
    if (percentage >= 50) return { grade: "C", color: "#F59E0B", label: "Keep Practicing!" };
    return { grade: "F", color: "#EF4444", label: "Need Improvement" };
  };

  if (phase === "loading") {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1.2rem" }}>
            Generating Questions...
          </h3>
          <p className="text-gray-400 text-sm">AI is creating your personalized test on "{topicInput}"</p>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="p-8 text-center text-white" style={{ background: "linear-gradient(135deg, #1e1b4b, #2563EB, #7C3AED)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white/10 backdrop-blur-sm">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              AI Self Test
            </h2>
            <p className="text-white/70">Test your knowledge and track your progress</p>
          </div>

          <div className="p-6">
            {/* Error */}
            {errorMsg && (
              <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
              </div>
            )}

            {/* Topic Input */}
            <div className="mb-5">
              <label className="text-gray-700 text-sm font-semibold mb-2 block">Subject / Topic</label>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-300 transition-colors">
                  <Brain className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && topicInput.trim() && generateQuestions()}
                    placeholder="e.g. Data Structures, Physics, World History..."
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Test Details */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: Brain, label: "Questions", value: "10 Q", color: "#2563EB" },
                { icon: Clock, label: "Duration", value: "30 min", color: "#7C3AED" },
                { icon: Target, label: "Passing", value: "60%", color: "#10B981" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-gray-900 font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Topics */}
            <div className="p-4 rounded-xl bg-gray-50 mb-6">
              <p className="text-gray-700 text-sm font-semibold mb-2">Topics Covered (click to toggle):</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTopic(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedTopics.includes(t)
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={!topicInput.trim()}
              className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              <Zap className="w-5 h-5" /> Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const gradeInfo = getGrade();
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 text-center text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e1b4b, #2563EB)" }}>
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
            <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              Test Complete!
            </h2>
            <p className="text-white/70">{topicInput} Self Test</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-5xl font-black mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: gradeInfo.color }}>
                  {gradeInfo.grade}
                </div>
                <p className="text-gray-400 text-sm">{gradeInfo.label}</p>
              </div>
              <div className="w-px h-16 bg-gray-100" />
              <div className="text-center">
                <div className="text-5xl font-black mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: gradeInfo.color }}>
                  {percentage}%
                </div>
                <p className="text-gray-400 text-sm">Score</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Correct", value: score, icon: CheckCircle, color: "#10B981" },
                { label: "Wrong", value: questions.length - score, icon: XCircle, color: "#EF4444" },
                { label: "Time Used", value: `${Math.floor(timeUsed / 60)}m ${timeUsed % 60}s`, icon: Clock, color: "#2563EB" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl border border-gray-100">
                  <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
                  <p className="text-gray-900 font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}aa)` }} />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>0%</span>
                <span className="text-gray-500 font-medium">Passing: 60%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPhase("intro"); setAnswers({}); setCurrentQ(0); setTimeLeft(30 * 60); setSelectedOption(null); setShowFeedback(false); setQuestions([]); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
              >
                <TrendingUp className="w-4 h-4" /> View Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Answer Review</h3>
          <div className="space-y-3">
            {questions.map((q) => {
              const isCorrect = answers[q.id] === q.correct;
              return (
                <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                  {isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className={`text-sm font-medium ${isCorrect ? "text-green-800" : "text-red-800"}`}>Q{q.id}. {q.question}</p>
                    {!isCorrect && (
                      <p className="text-green-700 text-xs mt-1">
                        ✓ Correct: {q.options[q.correct]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Test
  if (!questions.length || !questions[currentQ]) {
    setPhase("intro");
    return null;
  }
  const q = questions[currentQ];
  const answered = answers[q.id] !== undefined;
  const timePercent = (timeLeft / (30 * 60)) * 100;
  const isTimeWarning = timeLeft < 5 * 60;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      {/* Timer & Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono font-bold text-lg
            ${isTimeWarning ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
            <Clock className={`w-5 h-5 ${isTimeWarning ? "animate-pulse" : ""}`} />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{currentQ + 1}</span>
            / {questions.length}
          </div>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentQ ? "w-5" : answers[questions[i].id] !== undefined
                  ? answers[questions[i].id] === questions[i].correct ? "bg-green-400" : "bg-red-400"
                  : "bg-gray-200"
              }`}
                style={i === currentQ ? { background: "linear-gradient(90deg, #2563EB, #7C3AED)" } : {}} />
            ))}
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timePercent}%`,
              background: isTimeWarning ? "linear-gradient(90deg, #EF4444, #F97316)" : "linear-gradient(90deg, #2563EB, #06B6D4)"
            }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600">{q.subject}</span>
        </div>
        <h3 className="text-gray-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.5 }}>
          {currentQ + 1}. {q.question}
        </h3>

        <div className="space-y-3">
          {q.options.map((opt, oi) => {
            const isSelected = selectedOption === oi || answers[q.id] === oi;
            const isCorrect = oi === q.correct;
            return (
              <button
                key={oi}
                onClick={() => handleSelect(oi)}
                disabled={showFeedback || answered}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left text-sm transition-all border
                  ${showFeedback || answered
                    ? isCorrect
                      ? "border-green-200 bg-green-50 text-green-800"
                      : isSelected
                        ? "border-red-200 bg-red-50 text-red-800"
                        : "border-gray-100 bg-gray-50 text-gray-500"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 text-gray-700 cursor-pointer"
                  }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                  ${showFeedback || answered
                    ? isCorrect ? "bg-green-500 text-white" : isSelected ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                  {showFeedback || answered
                    ? isCorrect ? <CheckCircle className="w-4 h-4" /> : isSelected ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + oi)
                    : String.fromCharCode(65 + oi)
                  }
                </span>
                <span className="font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentQ === 0}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button
          onClick={handleNext}
          disabled={!answered && !showFeedback}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          {currentQ === questions.length - 1 ? "Submit Test" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
