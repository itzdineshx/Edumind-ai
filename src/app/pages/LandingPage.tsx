import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Brain,
  FileSearch,
  Mic,
  Link,
  ClipboardCheck,
  ArrowRight,
  Star,
  ChevronRight,
  Sparkles,
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  Play,
  CheckCircle,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "PDF Smart Search",
    description: "Upload any PDF and ask questions. Our AI instantly finds answers with page references and highlighted paragraphs.",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    badge: "Most Popular",
  },
  {
    icon: Mic,
    title: "Lecture to Notes",
    description: "Record or upload lectures. AI transcribes speech, removes noise, and generates beautiful structured notes.",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    badge: "AI Powered",
  },
  {
    icon: Link,
    title: "URL to Quiz Generator",
    description: "Paste any YouTube, blog or educational URL. AI generates MCQs, flashcards and short-answer questions instantly.",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    badge: "New",
  },
  {
    icon: ClipboardCheck,
    title: "Self Test System",
    description: "Practice with auto-generated tests, timed quizzes and instant scoring. Track your progress with smart analytics.",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    badge: "Interactive",
  },
];

const stats: { value: string; label: string; icon: typeof Users }[] = [];

const testimonials: { name: string; role: string; text: string; avatar: string; color: string }[] = [];

export function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F8FAFC" }} className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.2rem" }}
              className="text-gray-900">
              EduMind <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {["Features", "How it works", "Pricing", "About"].map((item) => (
              <a key={item} href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5">
              Sign In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-white text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24">
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #2563EB, transparent)" }} />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
              style={{ borderColor: "rgba(37,99,235,0.3)", background: "rgba(37,99,235,0.06)", color: "#2563EB" }}>
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI • Trusted by 50,000+ Students
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, lineHeight: 1.15 }}>
                AI Powered{" "}
                <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Smart Study
                </span>
                {" "}Assistant for Students
              </h1>
              <p className="text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
                Transform your PDFs, lectures, and online content into smart study materials. Ask questions, generate quizzes, and ace your exams with AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center gap-2 text-white px-7 py-3.5 rounded-2xl font-semibold transition-all hover:shadow-xl hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }}
                >
                  <Zap className="w-5 h-5" />
                  Upload Notes
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold transition-all hover:bg-gray-100 border border-gray-200 bg-white text-gray-700"
                >
                  <Play className="w-5 h-5 text-blue-600" />
                  Try AI Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-4 mt-8 justify-center lg:justify-start">
                {["No credit card required", "Free forever plan", "GDPR compliant"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(135deg, #1e1b4b, #1a1a3e)" }}>
                <img
                  src="https://images.unsplash.com/photo-1614492898637-435e0f87cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBsYXB0b3AlMjBBSSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzczMjA1NzI0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Student studying with AI"
                  className="w-full h-72 object-cover opacity-60 mix-blend-luminosity"
                />
                {/* Floating Cards */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end gap-3">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">AI is analyzing your PDF...</p>
                      <p className="text-white/60 text-xs">Found 12 key concepts on page 4</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-medium">Generating Quiz</span>
                      <span className="text-green-400 text-xs">78%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full w-3/4"
                        style={{ background: "linear-gradient(90deg, #06B6D4, #2563EB)" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stats badges */}
              <div className="absolute -left-6 top-10 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.1)" }}>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-bold">+30%</p>
                  <p className="text-gray-400 text-xs">Grade Boost</p>
                </div>
              </div>
              <div className="absolute -right-4 bottom-10 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(37,99,235,0.1)" }}>
                  <Users className="w-4 h-4" style={{ color: "#2563EB" }} />
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-bold">50K+</p>
                  <p className="text-gray-400 text-xs">Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl text-gray-900 mb-1"
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB" }}>
            <Sparkles className="w-3.5 h-3.5" />
            Powered by AI
          </div>
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
            Everything you need to{" "}
            <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              study smarter
            </span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Four powerful AI tools that transform how you learn, study, and prepare for exams.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              onClick={() => navigate("/login")}
              className="relative rounded-2xl p-6 border border-gray-100 bg-white cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {feature.badge && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${feature.bg}`, color: feature.color }}>
                  {feature.badge}
                </div>
              )}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: feature.bg }}>
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                style={{ color: feature.color }}>
                Try now <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1a1a3e 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-white mb-4"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              Students love EduMind AI
            </h2>
            <p className="text-white/60">Join thousands of students already studying smarter.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl p-6 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 text-sm mb-5 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${t.color}, #7C3AED)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/50 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl p-12" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))", border: "1px solid rgba(37,99,235,0.15)" }}>
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
            Ready to study smarter?
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Join 50,000+ students already using EduMind AI to ace their exams and boost their grades.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all hover:shadow-xl hover:scale-105"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              Start for Free <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-600 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
              EduMind AI
            </span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 EduMind AI. Built for students, by students.</p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
