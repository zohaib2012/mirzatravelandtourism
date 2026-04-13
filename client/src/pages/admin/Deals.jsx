import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";

const emptyForm = { title: "", description: "", imageUrl: "" };

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getDeals();
      setDeals(Array.isArray(data) ? data : data.deals || []);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (d) => {
    setForm({ title: d.title || "", description: d.description || "", imageUrl: d.imageUrl || "" });
    setEditing(d);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateDeal(editing.id, form);
        toast.success("Deal updated!");
      } else {
        await adminAPI.createDeal(form);
        toast.success("Deal added!");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete deal "${title}"?`)) return;
    try {
      await adminAPI.deleteDeal(id);
      toast.success("Deal deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Deals & Offers</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-gray-400">Loading...</div>
        ) : deals.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-400">No deals added yet</div>
        ) : deals.map((d) => (
          <div key={d.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            {d.imageUrl && <img src={d.imageUrl} alt={d.title} className="w-full h-44 object-cover" />}
            <div className="p-4">
              <h3 className="font-bold text-primary text-lg">{d.title}</h3>
              <div className="w-10 h-0.5 bg-accent my-2" />
              <p className="text-sm text-gray-600">{d.description}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(d)} className="flex-1 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center justify-center gap-2">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(d.id, d.title)} className="flex-1 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex items-center justify-center gap-2">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Deal" : "Add Deal"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="Deal title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" rows={3}
                placeholder="Deal description..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..." />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded border" onError={(e) => e.target.style.display = "none"} />
              )}
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default Deals;
