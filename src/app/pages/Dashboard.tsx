import { useNavigate } from "react-router";
import {
  FileSearch,
  Mic,
  Link,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  Clock,
  Upload,
  Search,
  Zap,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Brain,
  Target,
  Award,
} from "lucide-react";

const recentNotes: { title: string; date: string; type: string; pages?: number; duration?: string; source?: string; status: string; color: string }[] = [];

const upcomingTests: { subject: string; date: string; questions: number; duration: string; priority: string }[] = [];

const quickActions = [
  { icon: FileSearch, label: "PDF Smart Search", desc: "Ask questions from PDFs", path: "/dashboard/pdf-search", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  { icon: Mic, label: "Lecture to Notes", desc: "Upload audio/video", path: "/dashboard/lecture-notes", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  { icon: Link, label: "URL to Quiz", desc: "Generate quiz from link", path: "/dashboard/quiz-generator", color: "#06B6D4", bg: "rgba(6,182,212,0.08)" },
  { icon: ClipboardCheck, label: "Self Test", desc: "Practice & test yourself", path: "/dashboard/self-test", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { icon: BookOpen, label: "TN Syllabus", desc: "Browse exam topics", path: "/dashboard/syllabus", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
];

const studyProgress: { subject: string; progress: number; color: string }[] = [];

const achievements: { icon: typeof Brain; label: string; desc: string; earned: boolean }[] = [];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2563EB 60%, #7C3AED 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Welcome! 👋</p>
            <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              Welcome to EduMind AI
            </h2>
            <p className="text-white/70 text-sm">Start uploading your study materials to get started.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 min-w-[100px]">
              <p className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>0</p>
              <p className="text-white/70 text-xs mt-1">Day Streak 🔥</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 min-w-[100px]">
              <p className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>--</p>
              <p className="text-white/70 text-xs mt-1">Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick AI Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <input
            type="text"
            placeholder="Ask AI anything from your study materials..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:block">Search</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                style={{ background: action.bg }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <p className="text-gray-800 text-xs font-semibold mb-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {action.label}
              </p>
              <p className="text-gray-400 text-xs">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Notes - spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
              Recently Uploaded Notes
            </h3>
            <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "#2563EB" }}>
              <Upload className="w-4 h-4" /> Upload New
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNotes.map((note, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${note.color}15` }}>
                  <span className="text-xs font-bold" style={{ color: note.color }}>{note.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-medium truncate">{note.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {note.pages ? `${note.pages} pages` : note.duration || note.source} · {note.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{
                      background: note.status === "indexed" ? "rgba(37,99,235,0.08)" : note.status === "transcribed" ? "rgba(124,58,237,0.08)" : "rgba(16,185,129,0.08)",
                      color: note.status === "indexed" ? "#2563EB" : note.status === "transcribed" ? "#7C3AED" : "#10B981"
                    }}>
                    <CheckCircle className="w-3 h-3" />
                    {note.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
              Upcoming Tests
            </h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="p-4 space-y-3">
            {upcomingTests.map((test, i) => (
              <div key={i}
                onClick={() => navigate("/dashboard/self-test")}
                className="p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all"
                style={{
                  borderColor: test.priority === "high" ? "rgba(239,68,68,0.2)" : test.priority === "medium" ? "rgba(245,158,11,0.2)" : "rgba(107,114,128,0.2)",
                  background: test.priority === "high" ? "rgba(239,68,68,0.02)" : "white"
                }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-gray-800 text-sm font-semibold">{test.subject}</p>
                  {test.priority === "high" && (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-400 text-xs mb-2">{test.date}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{test.questions}Q</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{test.duration}</span>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/dashboard/self-test")}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              Start Practice Test
            </button>
          </div>
        </div>
      </div>

      {/* Study Progress & Achievements */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
              Study Progress
            </h3>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            {studyProgress.map((item) => (
              <div key={item.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-700 text-sm">{item.subject}</span>
                  <span className="text-gray-500 text-xs font-medium">{item.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}99)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
              Achievements
            </h3>
            <Award className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {achievements.map((a, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${a.earned ? "" : "opacity-50"}`}
                style={{ background: a.earned ? "rgba(37,99,235,0.04)" : "rgba(0,0,0,0.02)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: a.earned ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#f3f4f6" }}>
                  <a.icon className={`w-5 h-5 ${a.earned ? "text-white" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-semibold">{a.label}</p>
                  <p className="text-gray-400 text-xs">{a.desc}</p>
                </div>
                {a.earned && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                {!a.earned && <MoreHorizontal className="w-5 h-5 text-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
