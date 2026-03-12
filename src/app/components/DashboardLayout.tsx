import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Home,
  FileSearch,
  FileText,
  Zap,
  ClipboardCheck,
  BookOpen,
  Settings,
  Brain,
  Menu,
  X,
  Bell,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileSearch, label: "PDF Smart Search", path: "/dashboard/pdf-search" },
  { icon: FileText, label: "Lecture Notes", path: "/dashboard/lecture-notes" },
  { icon: Zap, label: "Quiz Generator", path: "/dashboard/quiz-generator" },
  { icon: ClipboardCheck, label: "Self Tests", path: "/dashboard/self-test" },
  { icon: BookOpen, label: "TN Syllabus", path: "/dashboard/syllabus" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "w-64" : "w-20"}
        `}
        style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #1a1a3e 50%, #0f172a 100%)" }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-white font-bold text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                EduMind AI
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? "text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                style={isActive ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" } : {}}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <NavLink
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </NavLink>
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Priya Sharma</p>
                <p className="text-white/50 text-xs truncate">priya@university.edu</p>
              </div>
              <LogOut className="w-4 h-4 text-white/40 hover:text-white cursor-pointer flex-shrink-0" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
                {navItems.find(n => location.pathname === n.path || (n.path !== "/dashboard" && location.pathname.startsWith(n.path)))?.label || "Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              AI Ready
            </div>
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #06B6D4, #2563EB)" }}>
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
