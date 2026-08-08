import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiCheckBadge,
  HiOutlineXCircle,
} from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const initials = (name = "") => name.slice(0, 2).toUpperCase() || "HH";

const EDIT_FIELDS = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "phonenumber", label: "Phone Number" },
  { key: "cnic", label: "CNIC" },
  { key: "bankAccount", label: "Bank / Card Account" },
];

const Users = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchUsers = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await client.post("/api/admin/adminalluser");
      setUsers(data);
    } catch {
      if (!silent) showToast("Could not load users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    // Near-real-time: quietly refresh so verification/edits made from
    // another admin session (or another tab) show up without a manual
    // reload, without flashing the loading state on every tick.
    const interval = setInterval(() => fetchUsers(true), 6000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.username, u.email, u.phonenumber, u.cnic].some((f) => String(f || "").toLowerCase().includes(q))
    );
  }, [users, query]);

  const toggleVerify = async (user) => {
    const endpoint = user.Verified ? "/api/admin/unverifyUser" : "/api/admin/verifyUser";
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, Verified: !u.Verified } : u)));
    try {
      await client.post(endpoint, { id: user._id });
      showToast(user.Verified ? "User unverified" : "User verified — their listings now show the verified badge", "success");
    } catch {
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, Verified: user.Verified } : u)));
      showToast("Could not update verification status", "error");
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      phonenumber: user.phonenumber || "",
      cnic: user.cnic || "",
      bankAccount: user.bankAccount || "",
    });
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      const { data } = await client.post("/api/admin/editUser", { id: editUser._id, ...editForm });
      setUsers((prev) => prev.map((u) => (u._id === editUser._id ? data.user : u)));
      showToast("User updated", "success");
      setEditUser(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update user", "error");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await client.post("/api/admin/deleteUser", { id: deleteTarget._id });
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast("User deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete user", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered users`}
        action={
          <div className="relative w-full sm:w-72">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone, CNIC…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        }
      />

      <div className="p-4 sm:p-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">CNIC</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-4" colSpan={5}>
                      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="border-b border-slate-50 transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <button onClick={() => setViewUser(user)} className="flex items-center gap-3 text-left">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                          {initials(user.username)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.username}</p>
                          <p className="text-xs text-slate-400">{user._id}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p>{user.email}</p>
                      <p className="text-xs text-slate-400">{user.phonenumber}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{user.cnic}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVerify(user)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                          user.Verified ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {user.Verified ? <HiCheckBadge className="h-4 w-4" /> : <HiOutlineXCircle className="h-4 w-4" />}
                        {user.Verified ? "Verified" : "Unverified"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewUser(user)}
                          title="View CNIC / Verify"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          <HiOutlineShieldCheck className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <HiOutlinePencilSquare className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Delete"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <HiOutlineTrash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* View / Verify modal */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details" wide>
        {viewUser && (
          <div>
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600">
                {initials(viewUser.username)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{viewUser.username}</p>
                <p className="text-sm text-slate-500">{viewUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div><p className="text-xs font-semibold uppercase text-slate-400">Phone</p><p className="mt-0.5 font-medium text-slate-700">{viewUser.phonenumber}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-400">CNIC</p><p className="mt-0.5 font-mono font-medium text-slate-700">{viewUser.cnic}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-400">Bank Account</p><p className="mt-0.5 font-medium text-slate-700">{viewUser.bankAccount}</p></div>
              <div><p className="text-xs font-semibold uppercase text-slate-400">Payment Account</p><p className="mt-0.5 truncate font-mono text-xs font-medium text-slate-700">{viewUser.BankAountStripeId || "—"}</p></div>
            </div>

            {viewUser.CNICImageArray?.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-400">CNIC Images</p>
                <div className="flex flex-wrap gap-3">
                  {viewUser.CNICImageArray.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block h-24 w-36 overflow-hidden rounded-lg border border-slate-200">
                      <img src={url} alt={`CNIC ${i + 1}`} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { toggleVerify(viewUser); setViewUser({ ...viewUser, Verified: !viewUser.Verified }); }}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition ${
                viewUser.Verified ? "bg-slate-400 hover:bg-slate-500" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              <HiCheckBadge className="h-5 w-5" />
              {viewUser.Verified ? "Remove Verification" : "Verify This User"}
            </button>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        footer={
          <button onClick={saveEdit} disabled={busy} className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60">
            {busy ? "Saving…" : "Save Changes"}
          </button>
        }
      >
        <div className="space-y-4">
          {EDIT_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</label>
              <input
                value={editForm[f.key] || ""}
                onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this user?"
        message={`"${deleteTarget?.username}" and their account will be permanently removed. This can't be undone.`}
        confirmLabel="Delete User"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Users;
