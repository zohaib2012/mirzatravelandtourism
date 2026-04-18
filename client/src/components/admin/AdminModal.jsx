import { FaTimes, FaCheck } from "react-icons/fa";

/**
 * Reusable Admin Modal wrapper - Enhanced Professional Design
 */
const AdminModal = ({ title, onClose, onSubmit, submitting, children, size = "md", icon: Icon }) => {
  const maxW = size === "lg" ? "max-w-3xl" : size === "xl" ? "max-w-4xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[92vh] flex flex-col animate-slideUp`}>
        {/* Gradient Header — sticky */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary to-deepblue rounded-t-2xl">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon className="text-white text-lg" />
              </div>
            )}
            <h3 className="font-bold text-lg text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-all">
            <FaTimes />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">{children}</div>

        {/* Footer — sticky */}
        {onSubmit && (
          <div className="flex-shrink-0 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-deepblue text-white rounded-xl hover:opacity-90 font-bold disabled:opacity-50 flex items-center gap-2 transition-all hover:shadow-lg"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
