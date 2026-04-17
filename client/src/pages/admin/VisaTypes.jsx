import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = { name: "", adultBuyRate: "", adultSellRate: "", childBuyRate: "", childSellRate: "" };

const VisaTypes = () => {
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
      const { data } = await adminAPI.getVisaTypes();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load visa types");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (v) => {
    setForm({
      name: v.name || "",
      adultBuyRate: v.adultBuyRate?.toString() || "", adultSellRate: v.adultSellRate?.toString() || "",
      childBuyRate: v.childBuyRate?.toString() || "", childSellRate: v.childSellRate?.toString() || "",
    });
    setEditing(v);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Visa type name required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateVisaType(editing.id, form);
        toast.success("Visa type updated!");
      } else {
        await adminAPI.createVisaType(form);
        toast.success("Visa type added!");
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
    const ok = await confirm({ title: "Delete Visa Type", message: `Delete visa type "${name}"? This action cannot be undone.` });
    if (!ok) return;
    try {
      await adminAPI.deleteVisaType(id);
      toast.success("Visa type deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Visa Types</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Visa Type
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Visa Type</th>
              <th className="px-3 py-3 text-right">Adult Buy</th>
              <th className="px-3 py-3 text-right">Adult Sell</th>
              <th className="px-3 py-3 text-right">Child Buy</th>
              <th className="px-3 py-3 text-right">Child Sell</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No visa types added yet</td></tr>
            ) : items.map((v, i) => (
              <tr key={v.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                <td className="px-3 py-3 font-semibold">{v.name}</td>
                <td className="px-3 py-3 text-right">{v.adultBuyRate ? Number(v.adultBuyRate).toLocaleString() : "-"}</td>
                <td className="px-3 py-3 text-right font-bold text-green-700">{v.adultSellRate ? Number(v.adultSellRate).toLocaleString() : "-"}</td>
                <td className="px-3 py-3 text-right">{v.childBuyRate ? Number(v.childBuyRate).toLocaleString() : "-"}</td>
                <td className="px-3 py-3 text-right font-bold text-green-700">{v.childSellRate ? Number(v.childSellRate).toLocaleString() : "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(v)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><FaEdit /></button>
                    <button onClick={() => handleDelete(v.id, v.name)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Visa Type" : "Add Visa Type"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Umrah Visa 30 Days" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "adultBuyRate", label: "Adult Buy Rate (PKR)" },
                { key: "adultSellRate", label: "Adult Sell Rate (PKR)" },
                { key: "childBuyRate", label: "Child Buy Rate (PKR)" },
                { key: "childSellRate", label: "Child Sell Rate (PKR)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
                </div>
              ))}
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default VisaTypes;
