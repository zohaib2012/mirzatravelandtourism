import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaUniversity } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";

const emptyForm = { bankName: "", accountTitle: "", accountNumber: "", iban: "", branchName: "", branchCode: "" };

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getBankAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (a) => {
    setForm({
      bankName: a.bankName || "", accountTitle: a.accountTitle || "",
      accountNumber: a.accountNumber || "", iban: a.iban || "",
      branchName: a.branchName || "", branchCode: a.branchCode || "",
    });
    setEditing(a);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.bankName.trim() || !form.accountTitle.trim() || !form.accountNumber.trim())
      return toast.error("Bank name, account title, and account number are required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateBankAccount(editing.id, form);
        toast.success("Bank account updated!");
      } else {
        await adminAPI.createBankAccount(form);
        toast.success("Bank account added!");
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
    if (!confirm(`Deactivate bank account "${name}"?`)) return;
    try {
      await adminAPI.deleteBankAccount(id);
      toast.success("Bank account deactivated");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Bank Accounts</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Bank Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-gray-400">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-400">No bank accounts added yet</div>
        ) : accounts.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-deepblue text-white p-4">
              <div className="flex items-center gap-3">
                <FaUniversity className="text-3xl opacity-40" />
                <div>
                  <h3 className="font-bold text-lg">{a.bankName}</h3>
                  <p className="text-sm opacity-80">{a.branchName || "Main Branch"}</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account Title</span>
                <span className="font-semibold text-right max-w-[60%]">{a.accountTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account #</span>
                <span className="font-mono font-semibold">{a.accountNumber}</span>
              </div>
              {a.iban && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IBAN</span>
                  <span className="font-mono text-xs">{a.iban}</span>
                </div>
              )}
              {a.branchCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Branch Code</span>
                  <span className="font-mono">{a.branchCode}</span>
                </div>
              )}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button onClick={() => openEdit(a)} className="flex-1 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center justify-center gap-1">
                <FaEdit /> Edit
              </button>
              <button onClick={() => handleDelete(a.id, a.bankName)} className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center gap-1">
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Bank Account" : "Add Bank Account"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting}>
          <div className="space-y-4">
            {[
              { key: "bankName", label: "Bank Name *", placeholder: "e.g. HBL - Habib Bank Limited" },
              { key: "accountTitle", label: "Account Title *", placeholder: "e.g. MIRZA TRAVEL & TOURISM" },
              { key: "accountNumber", label: "Account Number *", placeholder: "e.g. 1234-56789-01" },
              { key: "iban", label: "IBAN", placeholder: "e.g. PK86UNIL0109000320155293" },
              { key: "branchName", label: "Branch Name", placeholder: "e.g. Main Branch Karachi" },
              { key: "branchCode", label: "Branch Code", placeholder: "e.g. 0012" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={placeholder} />
              </div>
            ))}
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default BankAccounts;
