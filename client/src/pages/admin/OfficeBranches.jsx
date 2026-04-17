import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = { city: "", address: "", phone: "", isHead: false, imageUrl: "" };

const OfficeBranches = () => {
  const [branches, setBranches] = useState([]);
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
      const { data } = await adminAPI.getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (b) => {
    setForm({ city: b.city || "", address: b.address || "", phone: b.phone || "", isHead: b.isHead || false, imageUrl: b.imageUrl || "" });
    setEditing(b);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.city.trim()) return toast.error("City is required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateBranch(editing.id, form);
        toast.success("Branch updated!");
      } else {
        await adminAPI.createBranch(form);
        toast.success("Branch added!");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, city) => {
    const ok = await confirm({ title: "Delete Branch", message: `Delete "${city}" branch? This action cannot be undone.` });
    if (!ok) return;
    try {
      await adminAPI.deleteBranch(id);
      toast.success("Branch deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Office Branches</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-gray-400">Loading...</div>
        ) : branches.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-400">No branches added yet</div>
        ) : branches.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-28 bg-gradient-to-br from-primary to-deepblue flex items-center justify-center relative">
              {b.imageUrl ? (
                <img src={b.imageUrl} alt={b.city} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-accent">{b.city[0]}</span>
              )}
              {b.isHead && (
                <div className="absolute top-2 right-2 bg-accent text-primary text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <FaStar className="text-xs" /> HEAD
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-primary">{b.isHead ? `${b.city} (Head Office)` : `${b.city} Office`}</h3>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                {b.address && <div className="flex items-start gap-2"><FaMapMarkerAlt className="text-accent mt-0.5 shrink-0" /><span>{b.address}</span></div>}
                {b.phone && <div className="text-gray-500">{b.phone}</div>}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(b)} className="flex-1 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center justify-center gap-1">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(b.id, b.city)} className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center gap-1">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Branch" : "Add Branch"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Karachi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" rows={2}
                placeholder="Full address..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="+92 300 0000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isHead" checked={form.isHead} onChange={(e) => setForm({ ...form, isHead: e.target.checked })}
                className="w-4 h-4 accent-primary" />
              <label htmlFor="isHead" className="text-sm font-medium text-gray-700">This is the Head Office</label>
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default OfficeBranches;
