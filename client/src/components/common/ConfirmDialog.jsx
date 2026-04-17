import { useState, useCallback } from "react";
import { FaExclamationTriangle, FaTrash, FaTimes, FaCheck } from "react-icons/fa";

const ConfirmDialog = ({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center gap-3 ${confirmColor === "red" ? "bg-gradient-to-r from-red-600 to-red-700" : "bg-gradient-to-r from-primary to-deepblue"}`}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            {confirmColor === "red" ? (
              <FaTrash className="text-white text-sm" />
            ) : (
              <FaExclamationTriangle className="text-white text-sm" />
            )}
          </div>
          <h3 className="font-bold text-lg text-white">{title || "Confirm Action"}</h3>
          <button onClick={onCancel} className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-all">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:shadow-lg ${
              confirmColor === "red"
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90"
                : "bg-gradient-to-r from-primary to-deepblue hover:opacity-90"
            }`}
          >
            <FaCheck className="text-xs" />
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useConfirm = () => {
  const [state, setState] = useState({ open: false, title: "", message: "", confirmLabel: "Confirm", confirmColor: "red", resolve: null });

  const confirm = useCallback(({ title, message, confirmLabel = "Delete", confirmColor = "red" } = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, confirmLabel, confirmColor, resolve });
    });
  }, []);

  const handleClose = (value) => {
    state.resolve?.(value);
    setState((s) => ({ ...s, open: false, resolve: null }));
  };

  const Dialog = state.open ? (
    <ConfirmDialog
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      confirmColor={state.confirmColor}
      onConfirm={() => handleClose(true)}
      onCancel={() => handleClose(false)}
    />
  ) : null;

  return { confirm, Dialog };
};

export default ConfirmDialog;
