import { useState } from "react";
import { FaTimes, FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    // Simulate API call - actual implementation would call backend
    setTimeout(() => {
      toast.success("Password reset instructions sent to your email!");
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slideUp">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-primary">What's My Password?</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-sm text-gray-500 mb-4">
            Enter your email address and we'll send you password reset instructions.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50">
              {loading ? "Sending..." : "Send My Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
