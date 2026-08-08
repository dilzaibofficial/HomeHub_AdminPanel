import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMapPin } from "react-icons/hi2";
import client from "../api/client";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const EDIT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description", area: true },
  { key: "rent", label: "Monthly Rent (Rs)" },
  { key: "advance", label: "Advance (Rs)" },
  { key: "bedroom", label: "Bedrooms" },
  { key: "bathroom", label: "Bathrooms" },
  { key: "areaofhouse", label: "Area (sq ft)" },
  { key: "peoplesharing", label: "People Sharing" },
  { key: "address", label: "Address" },
];

const Properties = () => {
  const { showToast } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchProperties = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await client.post("/api/admin/allProperties");
      setProperties(data);
    } catch {
      if (!silent) showToast("Could not load properties", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProperties();
    const interval = setInterval(() => fetchProperties(true), 6000);
    return () => clearInterval(interval);
  }, [fetchProperties]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      [p.title, p.address, p.type, p.propertyowner?.username].some((f) => String(f || "").toLowerCase().includes(q))
    );
  }, [properties, query]);

  const openEdit = (property) => {
    setEditTarget(property);
    setEditForm({
      title: property.title || "",
      description: property.description || "",
      rent: property.rent ?? "",
      advance: property.advance ?? "",
      bedroom: property.bedroom ?? "",
      bathroom: property.bathroom ?? "",
      areaofhouse: property.areaofhouse ?? "",
      peoplesharing: property.peoplesharing ?? "",
      address: property.address || "",
    });
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      const { data } = await client.post("/api/admin/editProperty", { id: editTarget._id, ...editForm });
      setProperties((prev) => prev.map((p) => (p._id === editTarget._id ? { ...data.property, propertyowner: p.propertyowner } : p)));
      showToast("Property updated", "success");
      setEditTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update property", "error");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await client.post("/api/admin/deleteProperty", { id: deleteTarget._id });
      setProperties((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast("Property deleted", "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete property", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle={`${properties.length} listings on the platform`}
        action={
          <div className="relative w-72">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, address, owner…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            No properties found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property, i) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative h-36 bg-slate-100">
                  {property.assest?.[0] && (
                    <img src={property.assest[0]} alt={property.title} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {property.rented && (
                      <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white">RENTED</span>
                    )}
                    {property.propertySelling?.agreement && !property.rented && (
                      <span className="rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-white">IN AGREEMENT</span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{property.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                        <HiOutlineMapPin className="h-3.5 w-3.5 shrink-0" /> {property.address}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-brand-600">Rs {property.rent}</p>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Owner: <span className="font-medium text-slate-600">{property.propertyowner?.username || "—"}</span>
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEdit(property)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(property)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <HiOutlineTrash className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Property"
        wide
        footer={
          <button onClick={saveEdit} disabled={busy} className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60">
            {busy ? "Saving…" : "Save Changes"}
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {EDIT_FIELDS.map((f) => (
            <div key={f.key} className={f.area ? "col-span-2" : ""}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</label>
              {f.area ? (
                <textarea
                  value={editForm[f.key] || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              ) : (
                <input
                  value={editForm[f.key] || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              )}
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this property?"
        message={`"${deleteTarget?.title}" will be permanently removed from the platform. This can't be undone.`}
        confirmLabel="Delete Property"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Properties;
