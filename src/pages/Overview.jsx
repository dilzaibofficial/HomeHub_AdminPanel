import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineHomeModern,
  HiOutlineDocumentCheck,
  HiOutlineBanknotes,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";

const STAT_CONFIG = [
  { key: "totalUsers", label: "Total Users", icon: HiOutlineUsers, color: "brand" },
  { key: "totalProperty", label: "Properties Listed", icon: HiOutlineHomeModern, color: "emerald" },
  { key: "totalAgreement", label: "Agreements", icon: HiOutlineDocumentCheck, color: "amber" },
  { key: "totalCredit", label: "Transactions", icon: HiOutlineBanknotes, color: "violet" },
];

const COLOR_MAP = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

const StatCard = ({ stat, value, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4 }}
    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
  >
    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${COLOR_MAP[stat.color]}`}>
      <stat.icon className="h-5.5 w-5.5" />
    </div>
    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
      {value === undefined ? (
        <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        value.toLocaleString()
      )}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
  </motion.div>
);

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    client.post("/api/admin/allAnalytics").then((r) => setStats(r.data)).catch(() => setStats({}));
    client.post("/api/admin/adminalluser").then((r) => setUsers(r.data)).catch(() => {});
  }, []);

  const verifiedCount = users.filter((u) => u.Verified).length;
  const verifiedPct = users.length ? Math.round((verifiedCount / users.length) * 100) : 0;

  return (
    <div>
      <PageHeader title="Overview" subtitle="A snapshot of everything happening on HomeHub" />

      <div className="p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CONFIG.map((stat, i) => (
            <StatCard key={stat.key} stat={stat} value={stats?.[stat.key]} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <HiOutlineShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Identity Verification</p>
                <p className="text-xs text-slate-500">{verifiedCount} of {users.length} users verified</p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900">{verifiedPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${verifiedPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Overview;
