import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    contactPerson: "", phone: "", city: "", country: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI.getProfile().then(({ data }) => {
      setForm({
        contactPerson: data.contactPerson || "",
        phone: data.phone || "",
        city: data.city || "",
        country: data.country || "",
      });
      if (data.logoUrl) setLogoPreview(data.logoUrl);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      setUser({ ...user, contactPerson: data.user.contactPerson });
      localStorage.setItem("user", JSON.stringify({ ...user, contactPerson: data.user.contactPerson }));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> / Profile
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="font-bold text-primary">Update Your Profile</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
              <input type="text" value={user?.agencyName || ""} readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user?.email || ""} readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input type="text" value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone No.</label>
              <input type="text" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange}
              className="text-sm" />
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo" className="w-36 h-36 object-contain border rounded cursor-pointer"
                  onClick={() => window.open(logoPreview, "_blank")} />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold disabled:opacity-50">
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
