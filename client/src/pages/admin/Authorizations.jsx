import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";

const emptyForm = { name: "", description: "", logoUrl: "" };

const Authorizations = () => {
  const [auths, setAuths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAuthorizations();
      setAuths(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load authorizations");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (a) => {
    setForm({ name: a.name || "", description: a.description || "", logoUrl: a.logoUrl || "" });
    setEditing(a);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateAuthorization(editing.id, form);
        toast.success("Authorization updated!");
      } else {
        await adminAPI.createAuthorization(form);
        toast.success("Authorization added!");
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
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminAPI.deleteAuthorization(id);
      toast.success("Authorization deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Authorizations & Affiliations</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Authorization
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {loading ? (
          <div className="col-span-5 text-center py-8 text-gray-400">Loading...</div>
        ) : auths.length === 0 ? (
          <div className="col-span-5 text-center py-8 text-gray-400">No authorizations added yet</div>
        ) : auths.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
            {a.logoUrl ? (
              <img src={a.logoUrl} alt={a.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
            ) : (
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-3xl text-accent" />
              </div>
            )}
            <h4 className="font-bold text-primary text-sm">{a.name}</h4>
            {a.description && <p className="text-xs text-gray-500 mt-1">{a.description}</p>}
            <div className="mt-3 flex gap-1">
              <button onClick={() => openEdit(a)} className="flex-1 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">Edit</button>
              <button onClick={() => handleDelete(a.id, a.name)} className="flex-1 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Del</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Authorization" : "Add Authorization"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. IATA, PIA, Lufthansa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. IATA Accredited Agent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..." />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="preview" className="mt-2 h-16 object-contain border rounded mx-auto" onError={(e) => e.target.style.display = "none"} />
              )}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default Authorizations;
