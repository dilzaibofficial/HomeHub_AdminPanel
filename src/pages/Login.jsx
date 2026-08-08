import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineUser, HiArrowRight, HiOutlineShieldCheck } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950">
      {/* Left - branding panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-slate-950" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

        {/* Floating grid decoration */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <img src="/logo.png" alt="HomeHub" className="h-11 w-11 rounded-2xl bg-white p-1.5 object-contain shadow-lg" />
          <span className="text-xl font-bold text-white">HomeHub</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10"
        >
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Command center for<br />the entire platform.
          </h1>
          <p className="mt-4 max-w-md text-base text-blue-100/80">
            Verify tenants and landlords, manage every listing, and support
            users in real time — all from one place.
          </p>

          <div className="mt-10 flex gap-8">
            {[
              ["Real-time", "Verification"],
              ["Live", "Support Chat"],
              ["Full", "Control"],
            ].map(([a, b], i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <p className="text-2xl font-bold text-white">{a}</p>
                <p className="text-sm text-blue-100/70">{b}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-blue-100/50">© {new Date().getFullYear()} HomeHub. All rights reserved.</p>
      </div>

      {/* Right - form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <HiOutlineShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Sign In</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Username</label>
              <div className="relative">
                <HiOutlineUser className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <HiArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 lg:text-left">
            Default login: <span className="font-mono font-semibold text-slate-500">admin / admin</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
