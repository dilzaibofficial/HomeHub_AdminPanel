import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineCircleStack, HiOutlineArchiveBoxArrowDown, HiOutlineTrash } from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const Dataset = () => {
  const { showToast } = useToast();
  const [unexportedCount, setUnexportedCount] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await client.post("/api/admin/datasetSummary");
      setUnexportedCount(data.unexportedCount);
      setTotalCount(data.totalCount);
    } catch {
      setUnexportedCount(null);
      setTotalCount(null);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // The export endpoint is admin-token-gated (unlike the PDF download,
  // which can be a plain link since it's deliberately public) - so this
  // has to be a POST with a blob response, not an <a href> click.
  const downloadDataset = async () => {
    setDownloading(true);
    try {
      const response = await client.post("/api/admin/exportVerificationDataset", {}, { responseType: "blob" });
      const contentType = response.headers?.["content-type"] || "";

      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const parsed = JSON.parse(text);
        showToast(parsed.message || "No new samples to export yet", "info");
      } else {
        const blobUrl = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `homehub_verification_dataset_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
        showToast("Dataset downloaded", "success");
      }
      fetchSummary();
    } catch {
      showToast("Could not export the dataset", "error");
    } finally {
      setDownloading(false);
    }
  };

  const deleteDataset = async () => {
    setDeleting(true);
    try {
      const { data } = await client.post("/api/admin/deleteDataset");
      showToast(`Deleted ${data.deletedCount} sample${data.deletedCount === 1 ? "" : "s"}`, "success");
      setConfirmDeleteOpen(false);
      fetchSummary();
    } catch {
      showToast("Could not delete the dataset", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Verification Dataset" subtitle="Internal, labeled data collected from property verifications" />

      <div className="p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <HiOutlineCircleStack className="h-5.5 w-5.5" />
          </div>

          <p className="text-3xl font-extrabold tracking-tight text-slate-900">
            {unexportedCount === null ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              unexportedCount.toLocaleString()
            )}
          </p>
          <p className="mt-1 mb-1 text-sm font-medium text-slate-500">
            new labeled sample{unexportedCount === 1 ? "" : "s"} ready to export
          </p>
          <p className="mb-5 text-xs text-slate-400">
            {totalCount === null ? "…" : totalCount.toLocaleString()} total sample{totalCount === 1 ? "" : "s"} stored
          </p>

          <p className="mb-5 text-sm leading-relaxed text-slate-500">
            Each verification (auto-decided or admin-reviewed) adds labeled photo/frame pairs here - organized into
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">match</code> /
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">no_match</code> folders plus a
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">manifest.json</code>. This stays internal
            to HomeHub - nothing here is published anywhere automatically.
          </p>

          <div className="flex gap-3">
            <button
              onClick={downloadDataset}
              disabled={downloading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              <HiOutlineArchiveBoxArrowDown className="h-5 w-5" />
              {downloading ? "Preparing zip…" : "Download Dataset (.zip)"}
            </button>
            <button
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={!totalCount}
              title="Permanently delete all stored dataset samples"
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              <HiOutlineTrash className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete the entire dataset?"
        message={`All ${totalCount ?? 0} stored sample(s) - and their extracted frame images - will be permanently deleted, including any already downloaded. This can't be undone.`}
        confirmLabel="Delete Dataset"
        loading={deleting}
        onConfirm={deleteDataset}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};

export default Dataset;
