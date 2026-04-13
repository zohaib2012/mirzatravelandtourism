import { FaTimes } from "react-icons/fa";

/**
 * Reusable Admin Modal wrapper
 */
const AdminModal = ({ title, onClose, onSubmit, submitting, children, size = "md" }) => {
  const maxW = size === "lg" ? "max-w-3xl" : size === "xl" ? "max-w-4xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className={`bg-white rounded-xl shadow-2xl w-full ${maxW} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-lg text-primary">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {onSubmit && (
          <div className="px-5 pb-5 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</> : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
