import { useState, useEffect, useRef } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = { name: "", code: "", logoUrl: "" };

const Airlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
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

  const openAdd = () => { setForm(emptyForm); setLogoFile(null); setLogoPreview(null); setEditing(null); setModal("form"); };
  const openEdit = (a) => { 
    setForm({ name: a.name, code: a.code || "", logoUrl: a.logoUrl || "" }); 
    setLogoFile(null); 
    setLogoPreview(a.logoUrl || null);
    setEditing(a); 
    setModal("form"); 
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Airline name is required");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("code", form.code || "");
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name, logoFile.size);
        formData.append("logo", logoFile);
      }
      if (form.logoUrl) {
        console.log("Using logo URL:", form.logoUrl);
        formData.append("logoUrl", form.logoUrl);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      if (editing) {
        await adminAPI.updateAirline(editing.id, formData);
        toast.success("Airline updated!");
      } else {
        await adminAPI.createAirline(formData);
        toast.success("Airline added!");
      }
      setModal(null);
      load();
    } catch (err) {
      console.error("Save error:", err);
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
              <tr><td colSpan="5" className="px-4 py-10 text-center"><div className="flex items-center justify-center gap-2 text-gray-500"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading...</span></div></td></tr>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Airline Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange}
                ref={fileInputRef}
                className="hidden" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 border text-sm rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <FaUpload /> Choose File
                </button>
                {logoFile && <span className="text-sm text-gray-500 truncate">{logoFile.name}</span>}
              </div>
              {logoPreview && (
                <img src={logoPreview} alt="preview" className="mt-2 h-16 object-contain border rounded" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or Paste Logo URL</label>
              <input value={form.logoUrl} onChange={(e) => { setForm({ ...form, logoUrl: e.target.value }); setLogoFile(null); }}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..." />
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default Airlines;
