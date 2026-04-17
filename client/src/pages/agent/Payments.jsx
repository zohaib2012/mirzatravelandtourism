import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { paymentAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useConfirm } from "../../components/common/ConfirmDialog";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Submit form
  const [submitForm, setSubmitForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    bankAccountId: "",
    amount: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  // Filter form
  const [filters, setFilters] = useState({
    dateFrom: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    status: "POSTED",
  });

  useEffect(() => {
    loadPayments();
    paymentAPI.getBankAccounts().then(({ data }) => setBankAccounts(data)).catch(() => {});
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = { dateFrom: filters.dateFrom, dateTo: filters.dateTo };
      if (filters.status !== "all") params.status = filters.status;
      const { data } = await paymentAPI.getMy(params);
      setPayments(data.payments || []);
      setTotalAmount(data.totalAmount || 0);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const ok = await confirm({ title: "Submit Payment", message: "Are you sure you want to submit this payment record? This action cannot be undone.", confirmLabel: "Submit", confirmColor: "blue" });
    if (!ok) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("date", submitForm.date);
      formData.append("description", submitForm.description.toUpperCase());
      formData.append("bankAccountId", submitForm.bankAccountId);
      formData.append("amount", submitForm.amount);
      if (receiptFile) formData.append("receipt", receiptFile);

      await paymentAPI.submit(formData);
      toast.success("Payment submitted successfully");
      setSubmitForm({ date: format(new Date(), "yyyy-MM-dd"), description: "", bankAccountId: "", amount: "" });
      setReceiptFile(null);
      loadPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Add Payments</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> / Add Payments
        </nav>
      </div>

      {/* Submit Payment Form */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <h3 className="font-bold text-primary">Submit Payment</h3>
        </div>
        <form onSubmit={handleSubmitPayment} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={submitForm.date}
                onChange={(e) => setSubmitForm({ ...submitForm, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={submitForm.description}
                onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm uppercase focus:ring-2 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
              <select value={submitForm.bankAccountId}
                onChange={(e) => setSubmitForm({ ...submitForm, bankAccountId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required>
                <option value="">Select Account</option>
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.bankName} | {acc.accountTitle} | {acc.accountNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" value={submitForm.amount}
                onChange={(e) => setSubmitForm({ ...submitForm, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <input type="file" onChange={(e) => setReceiptFile(e.target.files[0])}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={submitting}
                className="w-full py-2 text-white font-bold rounded-lg disabled:opacity-50" style={{ backgroundColor: "#1d6eed" }}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <form onSubmit={(e) => { e.preventDefault(); loadPayments(); }} className="p-4" style={{ backgroundColor: "#1d6eed" }}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Date From</label>
              <input type="date" value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 rounded border-0 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Date To</label>
              <input type="date" value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 rounded border-0 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Status</label>
              <select value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded border-0 text-sm">
                <option value="all">Select Status</option>
                <option value="UNPOSTED">Un-Posted</option>
                <option value="POSTED">Posted</option>
              </select>
            </div>
            <div>
              <button type="submit" className="px-6 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 mt-5">
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-3 text-center" style={{ width: "5%" }}>#</th>
                <th className="px-3 py-3 text-center" style={{ width: "10%" }}>Voucher Id</th>
                <th className="px-3 py-3 text-center" style={{ width: "10%" }}>Date</th>
                <th className="px-3 py-3 text-center" style={{ width: "40%" }}>Description</th>
                <th className="px-3 py-3 text-center" style={{ width: "15%" }}>Amount</th>
                <th className="px-3 py-3 text-center" style={{ width: "10%" }}>Status</th>
                <th className="px-3 py-3 text-center" style={{ width: "10%" }}>Remarks</th>
                <th className="px-3 py-3 text-center" style={{ width: "10%" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No payments found</td></tr>
              ) : payments.map((p, i) => (
                <tr key={p.id} className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="px-3 py-2 text-center">{i + 1}</td>
                  <td className="px-3 py-2 text-center font-bold">{p.voucherId}</td>
                  <td className="px-3 py-2 text-center">{format(new Date(p.date), "dd MMM yyyy")}</td>
                  <td className="px-3 py-2">{p.description}</td>
                  <td className="px-3 py-2 text-center font-bold">{Number(p.amount).toLocaleString()}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === "POSTED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {p.status === "POSTED" ? "Posted" : "Un-Posted"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-500">{p.remarks || "-"}</td>
                  <td className="px-3 py-2 text-center">
                    {p.receiptUrl ? (
                      <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">View</a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-4 py-3 border-t text-right">
          <span className="font-bold">Total: PKR: {totalAmount.toLocaleString()}</span>
        </div>
      </div>
      {Dialog}
    </div>
  );
};

export default Payments;
