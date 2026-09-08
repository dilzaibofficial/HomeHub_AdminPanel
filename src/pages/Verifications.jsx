import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiCheckBadge, HiOutlineXCircle, HiOutlineVideoCamera } from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";

const scorePct = (score) => Math.round((score || 0) * 100);

const Verifications = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchQueue = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await client.post("/api/admin/verificationQueue");
      setItems(data);
    } catch {
      if (!silent) showToast("Could not load the verification queue", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchQueue();
    // Same silent-poll convention as Users/Properties - another admin
    // reviewing a case elsewhere shouldn't leave this list stale.
    const interval = setInterval(() => fetchQueue(true), 6000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const decide = async (property, decision) => {
    setBusy(true);
    const endpoint = decision === "approve" ? "/api/admin/approveVerification" : "/api/admin/rejectVerification";
    try {
      await client.post(endpoint, { id: property._id });
      setItems((prev) => prev.filter((p) => p._id !== property._id));
      setReviewItem(null);
      showToast(decision === "approve" ? "Property verified" : "Video deleted - user can now retake and resubmit", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not record this decision", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Verification Queue" subtitle={`${items.length} propert${items.length === 1 ? "y" : "ies"} awaiting manual review`} />

      <div className="p-4 sm:p-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3.5">Property</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5">Match Score</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-6 py-4" colSpan={5}>
                        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-400">
                      Nothing waiting on review right now - clear cases are auto-decided automatically.
                    </td>
                  </tr>
                ) : (
                  items.map((property, i) => (
                    <motion.tr
                      key={property._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className="border-b border-slate-50 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <button onClick={() => setReviewItem(property)} className="flex items-center gap-3 text-left">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <HiOutlineVideoCamera className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{property.title}</p>
                            <p className="text-xs text-slate-400">{property.address}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{property.propertyowner?.username || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {scorePct(property.verificationScore)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {property.verificationSubmittedAt ? new Date(property.verificationSubmittedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReviewItem(property)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
                          >
                            Review
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

      <Modal open={!!reviewItem} onClose={() => setReviewItem(null)} title="Review Verification" wide>
        {reviewItem && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">{reviewItem.title}</p>
                <p className="text-sm text-slate-500">{reviewItem.propertyowner?.username} · {reviewItem.address}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                {scorePct(reviewItem.verificationScore)}% match
              </span>
            </div>

            {reviewItem.verificationVideoUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                controls
                src={reviewItem.verificationVideoUrl}
                className="mb-5 w-full rounded-xl bg-black"
                style={{ maxHeight: 360 }}
              />
            ) : (
              <p className="mb-5 text-sm text-slate-400">No video available for this submission.</p>
            )}

            <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Reference Photos</p>
            <div className="mb-6 flex flex-wrap gap-3">
              {(reviewItem.assest || []).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Reference ${i + 1}`}
                  className="h-24 w-36 rounded-lg border border-slate-200 object-cover"
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => decide(reviewItem, "reject")}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <HiOutlineXCircle className="h-4.5 w-4.5" />
                Delete Video &amp; Ask to Retake
              </button>
              <button
                onClick={() => decide(reviewItem, "approve")}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                <HiCheckBadge className="h-4.5 w-4.5" />
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Verifications;
