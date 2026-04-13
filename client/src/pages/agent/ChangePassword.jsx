import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", rePassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.rePassword) {
      return toast.error("New passwords do not match");
    }
    if (form.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ oldPassword: "", newPassword: "", rePassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> / Password
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-md max-w-xl">
        <div className="p-4 border-b">
          <h3 className="font-bold text-primary">Create new Password</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
            <input type="password" value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              placeholder="Enter you Current/Old Password"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
          </div>

          <div className="mb-4 bg-gray-50 p-3 rounded-lg">
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li>New Password must be at least 8 characters in length</li>
              <li>New Password must contain 1 Upper Case</li>
              <li>New Password must contain 1 Number / Digit</li>
              <li>New Password must contain 1 Special Character from following (!, @, #, $, ^, &, *)</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="New Password"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Re-type Password</label>
            <input type="password" value={form.rePassword}
              onChange={(e) => setForm({ ...form, rePassword: e.target.value })}
              placeholder="ReType-Password"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
          </div>

          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold disabled:opacity-50">
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
