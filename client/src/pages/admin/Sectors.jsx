import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = { origin: "", destination: "", routeDisplay: "" };

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
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
      const { data } = await adminAPI.getSectors();
      setSectors(Array.isArray(data) ? data : data.sectors || []);
    } catch {
      toast.error("Failed to load sectors");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (s) => {
    setForm({ origin: s.origin || "", destination: s.destination || "", routeDisplay: s.routeDisplay || "" });
    setEditing(s);
    setModal(true);
  };

  // Auto-generate routeDisplay
  const handleOriginDestChange = (field, value) => {
    const updated = { ...form, [field]: value };
    if (!editing || !form.routeDisplay) {
      updated.routeDisplay = `${field === "origin" ? value : form.origin}-${field === "destination" ? value : form.destination}`.toUpperCase();
    }
    setForm(updated);
  };

  const handleSave = async () => {
    if (!form.origin.trim() || !form.destination.trim()) return toast.error("Origin and destination required");
    if (!form.routeDisplay.trim()) form.routeDisplay = `${form.origin}-${form.destination}`.toUpperCase();
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateSector(editing.id, form);
        toast.success("Sector updated!");
      } else {
        await adminAPI.createSector(form);
        toast.success("Sector added!");
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
    const ok = await confirm({ title: "Delete Sector", message: `Delete sector "${name}"? This cannot be undone. Sectors with active groups cannot be deleted.` });
    if (!ok) return;
    try {
      await adminAPI.deleteSector(id);
      toast.success("Sector deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot delete — sector may have active groups");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Sectors / Routes</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Sector
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Origin</th>
              <th className="px-3 py-3 text-left">Destination</th>
              <th className="px-3 py-3 text-left">Route Display</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : sectors.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No sectors added yet</td></tr>
            ) : sectors.map((s, i) => (
              <tr key={s.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                <td className="px-3 py-3 font-bold">{s.origin}</td>
                <td className="px-3 py-3 font-bold">{s.destination}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{s.routeDisplay}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(s.id, s.routeDisplay)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Sector" : "Add Sector"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin *</label>
                <input value={form.origin} onChange={(e) => handleOriginDestChange("origin", e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. KHI" maxLength={4} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                <input value={form.destination} onChange={(e) => handleOriginDestChange("destination", e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. DXB" maxLength={4} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route Display</label>
              <input value={form.routeDisplay} onChange={(e) => setForm({ ...form, routeDisplay: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. KHI-DXB or KHI-JED-MED-KHI" />
              <p className="text-xs text-gray-400 mt-1">Auto-generated but editable. Used for display in flight groups.</p>
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default Sectors;
