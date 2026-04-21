import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaSave, FaLock } from "react-icons/fa";

const Settings = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "", tagline: "", phone: "", email: "", address: "",
    whatsapp: "", facebook: "", instagram: "", logoUrl: "",
    faviconUrl: "", primaryColor: "#0C446F", accentColor: "#FAAF43",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminAPI.getSettings()
      .then(({ data }) => {
        if (data) setForm((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await adminAPI.updateSettings(form);
      toast.success("Settings saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Company Settings</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/update-password")}
            className="px-5 py-2 bg-accent text-white rounded-lg flex items-center gap-2 hover:opacity-90">
            <FaLock /> Saved
          </button>
          <button onClick={handleSave} disabled={submitting}
          className="px-5 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          <FaSave /> {submitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-bold text-primary mb-4 pb-2 border-b">Company Information</h3>
          <div className="space-y-4">
            {[
              { key: "companyName", label: "Company Name", placeholder: "Mirza Travel & Tourism" },
              { key: "tagline", label: "Tagline", placeholder: "Your trusted travel partner" },
              { key: "phone", label: "Phone / Helpline", placeholder: "+92 300 0000000" },
              { key: "email", label: "Email", placeholder: "info@mirzatravel.pk" },
              { key: "address", label: "Address", placeholder: "Main Office Address" },
              { key: "whatsapp", label: "WhatsApp Number", placeholder: "+92 300 0000000" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={placeholder} />
              </div>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-bold text-primary mb-4 pb-2 border-b">Branding & Social</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input value={form.logoUrl || ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://..." />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="logo" className="mt-2 h-16 object-contain border rounded" onError={(e) => e.target.style.display = "none"} />
              )}
            </div>
            {[
              { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
              { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={placeholder} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primaryColor || "#0C446F"} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer" />
                  <input value={form.primaryColor || ""} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accentColor || "#FAAF43"} onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer" />
                  <input value={form.accentColor || ""} onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
