import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaSearch, FaBook } from "react-icons/fa";

const AgentLedgers = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [agentInfo, setAgentInfo] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAgents({ status: "ACTIVE" })
      .then(({ data }) => setAgents(data.agents || []))
      .catch(() => {})
      .finally(() => setAgentsLoading(false));
  }, []);

  const loadLedger = async (agentId) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAgentLedger(agentId);
      setLedger(data.entries || []);
      setAgentInfo(data.agent);
      setCurrentBalance(data.currentBalance || 0);
    } catch {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAgent = (e) => {
    const agentId = e.target.value;
    setSelectedAgent(agentId);
    if (agentId) loadLedger(agentId);
    else { setLedger([]); setAgentInfo(null); }
  };

  const totalDebit = ledger.reduce((s, e) => s + Number(e.debit || 0), 0);
  const totalCredit = ledger.reduce((s, e) => s + Number(e.credit || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Agent Ledgers</h1>
      </div>

      {/* Agent Selector */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-5">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
            <select value={selectedAgent || ""} onChange={handleSelectAgent}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
              <option value="">-- Select Agent --</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.agentCode} - {a.contactPerson || a.agencyName}</option>
              ))}
            </select>
          </div>
        </div>

        {agentInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Agent:</span>
              <div className="font-bold">{agentInfo.contactPerson}</div>
            </div>
            <div>
              <span className="text-gray-500">Code:</span>
              <div className="font-bold">{agentInfo.agentCode}</div>
            </div>
            <div>
              <span className="text-gray-500">Balance Due:</span>
              <div className={`font-bold text-lg ${currentBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                PKR {Math.abs(currentBalance).toLocaleString()} {currentBalance > 0 ? "(Due)" : "(Advance)"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      {selectedAgent && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-800 text-white font-bold flex items-center gap-2">
            <FaBook /> Ledger Entries
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Debit</th>
                  <th className="px-3 py-2 text-right">Credit</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-10 text-center"><div className="flex items-center justify-center gap-2 text-gray-500"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm">Loading...</span></div></td></tr>
                ) : ledger.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No ledger entries</td></tr>
                ) : ledger.map((e, i) => (
                  <tr key={e.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-xs">{format(new Date(e.createdAt), "dd MMM yyyy")}</td>
                    <td className="px-3 py-2">{e.description}</td>
                    <td className="px-3 py-2 text-right text-red-600">{Number(e.debit) > 0 ? Number(e.debit).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2 text-right text-green-600">{Number(e.credit) > 0 ? Number(e.credit).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2 text-right font-bold">{Number(e.balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-800 text-white">
                <tr>
                  <td colSpan="3" className="px-3 py-2 font-bold">TOTALS</td>
                  <td className="px-3 py-2 text-right font-bold text-red-300">PKR {totalDebit.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold text-green-300">PKR {totalCredit.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold">PKR {currentBalance.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLedgers;
