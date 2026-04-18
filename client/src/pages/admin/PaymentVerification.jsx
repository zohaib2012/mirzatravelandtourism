import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("UNPOSTED");
  const [viewModal, setViewModal] = useState(null);
  const [remarkModal, setRemarkModal] = useState(null);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await adminAPI.getAllPayments(params);
      setPayments(data.payments || []);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setSubmitting(true);
    try {
      await adminAPI.updatePaymentStatus(id, { status, adminRemarks: remark });
      toast.success(`Payment ${status === "POSTED" ? "posted" : "unposted"}!`);
      setRemarkModal(null);
      setRemark("");
      load();
    } catch {
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openRemark = (payment, targetStatus) => {
    setRemarkModal({ payment, targetStatus });
    setRemark(payment.remarks || "");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Payment Verification</h1>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded text-sm">
            <option value="">All</option>
            <option value="UNPOSTED">Unposted</option>
            <option value="POSTED">Posted</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Agent</th>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Description</th>
              <th className="px-3 py-3 text-left">Bank</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-3 py-3 text-left">Receipt</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="px-4 py-10 text-center"><div className="flex items-center justify-center gap-2 text-gray-500"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading...</span></div></td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">No payments found</td></tr>
            ) : payments.map((p, i) => (
              <tr key={p.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                <td className="px-3 py-3">
                  <div className="font-semibold">{p.agent?.agencyName || p.agent?.contactPerson}</div>
                  <div className="text-xs text-gray-500">{p.agent?.agentCode}</div>
                </td>
                <td className="px-3 py-3 text-xs">{p.paymentDate ? format(new Date(p.paymentDate), "dd MMM yyyy") : format(new Date(p.createdAt), "dd MMM yyyy")}</td>
                <td className="px-3 py-3 max-w-[150px] truncate">{p.description || "-"}</td>
                <td className="px-3 py-3 text-xs">{p.bankAccount?.bankName}<br />{p.bankAccount?.accountTitle}</td>
                <td className="px-3 py-3 text-right font-bold text-green-700">PKR {Number(p.amount).toLocaleString()}</td>
                <td className="px-3 py-3">
                  {p.receiptUrl ? (
                    <a href={p.receiptUrl} target="_blank" rel="noreferrer"
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 flex items-center gap-1 w-fit">
                      <FaEye /> View
                    </a>
                  ) : <span className="text-gray-400 text-xs">No file</span>}
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === "POSTED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {p.status}
                  </span>
                  {p.remarks && <div className="text-xs text-gray-400 mt-1 max-w-[100px] truncate">{p.remarks}</div>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {p.status === "UNPOSTED" && (
                      <button onClick={() => openRemark(p, "POSTED")}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center gap-1">
                        <FaCheck /> Post
                      </button>
                    )}
                    {p.status === "POSTED" && (
                      <button onClick={() => openRemark(p, "UNPOSTED")}
                        className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 flex items-center gap-1">
                        <FaTimes /> Unpost
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t text-sm text-gray-500">
          Total: {payments.length} payments | Total Amount: PKR {payments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}
        </div>
      </div>

      {/* Remark Modal */}
      {remarkModal && (
        <AdminModal
          title={`${remarkModal.targetStatus === "POSTED" ? "Post" : "Unpost"} Payment`}
          onClose={() => setRemarkModal(null)}
          onSubmit={() => updateStatus(remarkModal.payment.id, remarkModal.targetStatus)}
          submitting={submitting}
        >
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded text-sm">
              <p><strong>Agent:</strong> {remarkModal.payment.agent?.agencyName} ({remarkModal.payment.agent?.agentCode})</p>
              <p><strong>Amount:</strong> PKR {Number(remarkModal.payment.amount).toLocaleString()}</p>
              <p><strong>Date:</strong> {format(new Date(remarkModal.payment.paymentDate || remarkModal.payment.createdAt), "dd MMM yyyy")}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Remarks (optional)</label>
              <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                rows={3} placeholder="Add remarks..." />
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default PaymentVerification;
