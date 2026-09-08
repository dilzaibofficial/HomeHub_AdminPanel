import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineCircleStack, HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import { useToast } from "../context/ToastContext";

const Dataset = () => {
  const { showToast } = useToast();
  const [unexportedCount, setUnexportedCount] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await client.post("/api/admin/datasetSummary");
      setUnexportedCount(data.unexportedCount);
    } catch {
      setUnexportedCount(null);
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
          <p className="mt-1 mb-5 text-sm font-medium text-slate-500">new labeled sample{unexportedCount === 1 ? "" : "s"} ready to export</p>

          <p className="mb-5 text-sm leading-relaxed text-slate-500">
            Each verification (auto-decided or admin-reviewed) adds labeled photo/frame pairs here - organized into
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">match</code> /
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">no_match</code> folders plus a
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">manifest.json</code>. This stays internal
            to HomeHub - nothing here is published anywhere automatically.
          </p>

          <button
            onClick={downloadDataset}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <HiOutlineArchiveBoxArrowDown className="h-5 w-5" />
            {downloading ? "Preparing zip…" : "Download Dataset (.zip)"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dataset;
