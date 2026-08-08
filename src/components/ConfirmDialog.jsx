import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirm", danger = true, loading, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${danger ? "bg-red-50 text-red-500" : "bg-brand-50 text-brand-600"}`}>
            <HiOutlineExclamationTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                danger ? "bg-red-500 hover:bg-red-600" : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              {loading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;
