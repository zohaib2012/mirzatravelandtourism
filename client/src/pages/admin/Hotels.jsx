import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { packageAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = {
  name: "", city: "MAKKAH", starRating: "5", distance: "",
  sharingRate: "", doubleRate: "", tripleRate: "", quadRate: "", quintRate: "",
};

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  useEffect(() => { load(); }, [cityFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = cityFilter ? { city: cityFilter } : {};
      const { data } = await adminAPI.getHotels(params);
      setHotels(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (h) => {
    setForm({
      name: h.name, city: h.city, starRating: h.starRating?.toString() || "5",
      distance: h.distance?.toString() || "",
      sharingRate: h.sharingRate?.toString() || "", doubleRate: h.doubleRate?.toString() || "",
      tripleRate: h.tripleRate?.toString() || "", quadRate: h.quadRate?.toString() || "",
      quintRate: h.quintRate?.toString() || "",
    });
    setEditing(h);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Hotel name required");
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editing) {
        await adminAPI.updateHotel(editing.id, payload);
        toast.success("Hotel updated!");
      } else {
        await adminAPI.createHotel(payload);
        toast.success("Hotel added!");
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
    const ok = await confirm({ title: "Deactivate Hotel", message: `Deactivate hotel "${name}"? It will be removed from the active list.`, confirmLabel: "Deactivate" });
    if (!ok) return;
    try {
      await adminAPI.deleteHotel(id);
      toast.success("Hotel deactivated");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const f = (val) => (val && Number(val) > 0 ? Number(val).toLocaleString() : "-");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Hotels</h1>
        <div className="flex gap-3">
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 border rounded text-sm">
            <option value="">All Cities</option>
            <option value="MAKKAH">Makkah</option>
            <option value="MADINA">Madina</option>
          </select>
          <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
            <FaPlus /> Add Hotel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Hotel Name</th>
              <th className="px-3 py-2 text-left">City</th>
              <th className="px-3 py-2 text-center">Stars</th>
              <th className="px-3 py-2 text-center">Distance</th>
              <th className="px-3 py-2 text-center">Sharing</th>
              <th className="px-3 py-2 text-center">Double</th>
              <th className="px-3 py-2 text-center">Triple</th>
              <th className="px-3 py-2 text-center">Quad</th>
              <th className="px-3 py-2 text-center">Quint</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="11" className="px-4 py-10 text-center"><div className="flex items-center justify-center gap-2 text-gray-500"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading...</span></div></td></tr>
            ) : hotels.length === 0 ? (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-400">No hotels found</td></tr>
            ) : hotels.map((h, i) => (
              <tr key={h.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-semibold">{h.name}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${h.city === "MAKKAH" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{h.city}</span>
                </td>
                <td className="px-3 py-2 text-center text-accent">{"★".repeat(h.starRating || 0)}</td>
                <td className="px-3 py-2 text-center">{h.distance ? `${Number(h.distance)}m` : "-"}</td>
                <td className="px-3 py-2 text-center">{f(h.sharingRate)}</td>
                <td className="px-3 py-2 text-center">{f(h.doubleRate)}</td>
                <td className="px-3 py-2 text-center">{f(h.tripleRate)}</td>
                <td className="px-3 py-2 text-center">{f(h.quadRate)}</td>
                <td className="px-3 py-2 text-center">{f(h.quintRate)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(h)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><FaEdit /></button>
                    <button onClick={() => handleDelete(h.id, h.name)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Hotel" : "Add Hotel"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Hotel name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="MAKKAH">Makkah</option>
                  <option value="MADINA">Madina</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
                <select value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance from Haram (meters)</label>
                <input type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 200" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: "sharingRate", label: "Sharing" },
                { key: "doubleRate", label: "Double" },
                { key: "tripleRate", label: "Triple" },
                { key: "quadRate", label: "Quad" },
                { key: "quintRate", label: "Quint" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label} Rate (PKR)</label>
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

export default Hotels;
