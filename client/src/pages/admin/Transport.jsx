import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaBus } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = { vehicleType: "", route: "", buyRate: "", sellRate: "" };

const Transport = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getTransports();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load transport");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (t) => {
    setForm({
      vehicleType: t.vehicleType || "",
      route: t.route || "",
      buyRate: t.buyRate?.toString() || "",
      sellRate: t.sellRate?.toString() || "",
    });
    setEditing(t);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.vehicleType.trim()) return toast.error("Vehicle name required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateTransport(editing.id, form);
        toast.success("Transport updated!");
      } else {
        await adminAPI.createTransport(form);
        toast.success("Transport added!");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({ title: "Delete Transport", message: `Are you sure you want to delete "${name}"? This action cannot be undone.` });
    if (!ok) return;
    try {
      await adminAPI.deleteTransport(id);
      toast.success("Transport deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Transport</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Transport
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Vehicle Name</th>
              <th className="px-3 py-3 text-left">Route</th>
              <th className="px-3 py-3 text-right">Buy Rate</th>
              <th className="px-3 py-3 text-right">Sell Rate</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No transport added yet</td></tr>
            ) : items.map((t, i) => (
              <tr key={t.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                <td className="px-3 py-3 font-semibold flex items-center gap-2"><FaBus className="text-accent" />{t.vehicleType}</td>
                <td className="px-3 py-3 text-xs">{t.route || "-"}</td>
                <td className="px-3 py-3 text-right">{t.buyRate ? Number(t.buyRate).toLocaleString() : "-"}</td>
                <td className="px-3 py-3 text-right font-bold text-green-700">{t.sellRate ? Number(t.sellRate).toLocaleString() : "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><FaEdit /></button>
                    <button onClick={() => handleDelete(t.id, t.vehicleType)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Transport" : "Add Transport"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name *</label>
              <input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Luxury Bus 50 Seater" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
              <input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Makkah - Madina - Makkah" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buy Rate (PKR)</label>
                <input type="number" value={form.buyRate} onChange={(e) => setForm({ ...form, buyRate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sell Rate (PKR)</label>
                <input type="number" value={form.sellRate} onChange={(e) => setForm({ ...form, sellRate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
              </div>
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default Transport;
