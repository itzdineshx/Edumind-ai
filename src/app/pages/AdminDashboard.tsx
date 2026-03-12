import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { logout, type UserProfile } from "../../services/auth";
import { LogOut, Zap, Users, ShieldCheck } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setEmail(user.email ?? "");
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as UserProfile) }));
        setUsers(list);
      } catch {
        /* ignore */
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-900 font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
              EduMind Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm hidden sm:block">{email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #7C3AED 60%, #2563EB 100%)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
            style={{ background: "radial-gradient(circle, white, transparent)" }} />
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Admin Dashboard</p>
            <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              Hello, Admin 🛡️
            </h2>
            <p className="text-white/70 text-sm">Manage users and monitor platform activity.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
                <Users className="w-5 h-5" style={{ color: "#2563EB" }} />
              </div>
              <p className="text-gray-500 text-sm">Total Users</p>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {loadingUsers ? "…" : users.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.08)" }}>
                <Zap className="w-5 h-5" style={{ color: "#10B981" }} />
              </div>
              <p className="text-gray-500 text-sm">Students</p>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {loadingUsers ? "…" : users.filter((u) => u.role === "student").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                <ShieldCheck className="w-5 h-5" style={{ color: "#7C3AED" }} />
              </div>
              <p className="text-gray-500 text-sm">Admins</p>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {loadingUsers ? "…" : users.filter((u) => u.role === "admin").length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "1rem" }}>
              All Users
            </h3>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">UID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-800">{u.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: u.role === "admin" ? "rgba(124,58,237,0.08)" : "rgba(37,99,235,0.08)",
                            color: u.role === "admin" ? "#7C3AED" : "#2563EB",
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{u.uid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
