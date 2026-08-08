import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlinePlus, HiOutlineShieldCheck } from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const Admins = () => {
  const { showToast } = useToast();
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await client.post("/api/admin/listAdmins");
      setAdmins(data);
    } catch {
      showToast("Could not load admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async () => {
    if (!form.username.trim() || !form.password.trim()) return;
    setBusy(true);
    try {
      await client.post("/api/admin/createAdmin", form);
      showToast(`Admin "${form.username}" created`, "success");
      setForm({ username: "", password: "" });
      setOpen(false);
      fetchAdmins();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not create admin", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Admins"
        subtitle="Everyone with access to this dashboard"
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
          >
            <HiOutlinePlus className="h-4.5 w-4.5" /> New Admin
          </button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)
            : admins.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <HiOutlineShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {a.username}
                      {a._id === currentAdmin?._id && (
                        <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">YOU</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">Joined {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Admin"
        footer={
          <button
            onClick={createAdmin}
            disabled={busy}
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create Admin"}
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admins;
