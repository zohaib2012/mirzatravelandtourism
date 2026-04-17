import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = { name: "", code: "", logoUrl: "" };

const Airlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAirlines();
      setAirlines(data.airlines || []);
    } catch {
      toast.error("Failed to load airlines");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal("form"); };
  const openEdit = (a) => { setForm({ name: a.name, code: a.code || "", logoUrl: a.logoUrl || "" }); setEditing(a); setModal("form"); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Airline name is required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateAirline(editing.id, form);
        toast.success("Airline updated!");
      } else {
        await adminAPI.createAirline(form);
        toast.success("Airline added!");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({ title: "Delete Airline", message: `Delete "${name}"? This may affect existing flight groups.` });
    if (!ok) return;
    try {
      await adminAPI.deleteAirline(id);
      toast.success("Airline deleted");
      load();
    } catch {
      toast.error("Delete failed - airline may have groups");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Airlines</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Airline
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Logo</th>
              <th className="px-3 py-3 text-left">Airline Name</th>
              <th className="px-3 py-3 text-left">Code</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : airlines.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No airlines added yet</td></tr>
            ) : airlines.map((a, i) => (
              <tr key={a.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                <td className="px-3 py-3">
                  {a.logoUrl ? (
                    <img src={a.logoUrl} alt={a.name} className="w-10 h-10 object-contain rounded border" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                      {a.code || a.name[0]}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 font-semibold">{a.name}</td>
                <td className="px-3 py-3 font-mono text-sm">{a.code || "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(a)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(a.id, a.name)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "form" && (
        <AdminModal
          title={editing ? "Edit Airline" : "Add Airline"}
          onClose={() => setModal(null)}
          onSubmit={handleSave}
          submitting={submitting}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airline Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Pakistan International Airlines" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. PK" maxLength={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..." />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="preview" className="mt-2 h-12 object-contain border rounded" onError={(e) => e.target.style.display = "none"} />
              )}
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default Airlines;
