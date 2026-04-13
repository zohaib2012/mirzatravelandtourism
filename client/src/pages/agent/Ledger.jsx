import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { paymentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import toast from "react-hot-toast";

const Ledger = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0, closingBalance: 0, closingType: "Cr" });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.getLedger(filters);
      setEntries(data.entries || []);
      setTotals({
        totalDebit: data.totalDebit || 0,
        totalCredit: data.totalCredit || 0,
        closingBalance: Math.abs(data.closingBalance || 0),
        closingType: data.closingType || "Cr",
      });
    } catch {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ledger</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> / Ledger
        </nav>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <form onSubmit={(e) => { e.preventDefault(); loadLedger(); }} className="p-4" style={{ backgroundColor: "#1d6eed" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
              <button type="submit" className="px-6 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 mt-5">
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* Ledger Header */}
        <div className="p-4 border-b flex flex-wrap items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-600">
              Ledger of {user?.agencyName}
            </h3>
            <p className="text-sm text-green-600">
              From {format(new Date(filters.dateFrom), "EEE, dd MMM yyyy")} To {format(new Date(filters.dateTo), "EEE, dd MMM yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 print:hidden">
              Print Ledger
            </button>
            <span className="text-green-600 font-bold">Opening Balance 0 Cr</span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border text-left">V #.</th>
                <th className="px-3 py-2 border text-left">Dated</th>
                <th className="px-3 py-2 border text-left">Description</th>
                <th className="px-3 py-2 border text-right">Debit</th>
                <th className="px-3 py-2 border text-right">Credit</th>
                <th className="px-3 py-2 border text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No entries found</td></tr>
              ) : entries.map((e, i) => (
                <tr key={e.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-3 py-2 border">{e.voucherNo || "-"}</td>
                  <td className="px-3 py-2 border">{format(new Date(e.date), "dd MMM yyyy")}</td>
                  <td className="px-3 py-2 border">{e.description}</td>
                  <td className="px-3 py-2 border text-right">{Number(e.debit) > 0 ? Number(e.debit).toFixed(2) : ""}</td>
                  <td className="px-3 py-2 border text-right">{Number(e.credit) > 0 ? Number(e.credit).toFixed(2) : ""}</td>
                  <td className="px-3 py-2 border text-right font-bold">
                    {Math.abs(e.runningBalance || 0).toFixed(2)} {(e.runningBalance || 0) >= 0 ? "Dr" : "Cr"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-4 flex justify-end">
          <table className="text-sm border">
            <tbody>
              <tr>
                <td className="px-4 py-2 border font-bold">Total Debit</td>
                <td className="px-4 py-2 border font-bold">Total Credit</td>
                <td className="px-4 py-2 border font-bold">Closing Balance</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border text-right">
                  <input type="text" readOnly value={totals.totalDebit.toFixed(2)} className="w-32 text-right bg-transparent border-0 font-bold" />
                </td>
                <td className="px-4 py-2 border text-right">
                  <input type="text" readOnly value={totals.totalCredit.toFixed(2)} className="w-32 text-right bg-transparent border-0 font-bold" />
                </td>
                <td className="px-4 py-2 border text-right">
                  <input type="text" readOnly value={`${totals.closingBalance.toFixed(2)} ${totals.closingType}`}
                    className="w-32 text-right bg-transparent border-0 font-black" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
