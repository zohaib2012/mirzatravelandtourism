import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaCheck, FaTimes, FaBan, FaUserCheck, FaSearch, FaUserShield, FaPlus, FaFilter } from "react-icons/fa";
import { useConfirm } from "../../components/common/ConfirmDialog";

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-600 border border-gray-200",
  REJECTED: "bg-red-100 text-red-700 border border-red-200",
};

const Agents = () => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState("");
  const { confirm, Dialog } = useConfirm();

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await adminAPI.getAgents(params);
      setAgents(data.agents || []);
    } catch {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const labels = { ACTIVE: "approve", REJECTED: "reject", INACTIVE: "deactivate" };
    const ok = await confirm({ title: "Confirm Action", message: `Are you sure you want to ${labels[status] || "update"} this agent?`, confirmLabel: "Yes, Continue", confirmColor: "blue" });
    if (!ok) return;
    try {
      await adminAPI.updateAgentStatus(id, { status });
      toast.success(`Agent ${status.toLowerCase()}!`);
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  const filtered = agents.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.agentCode?.toLowerCase().includes(s) || a.contactPerson?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-deepblue flex items-center justify-center shadow-lg shadow-primary/30">
            <FaUserShield className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Agent Management</h1>
            <p className="text-gray-500 text-sm">Manage and track all registered agents</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filter:</span>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code, name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold text-primary">{filtered.length}</span> of <span className="font-semibold">{agents.length}</span> agents
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Agent Code</th>
                <th className="px-5 py-4 text-left font-semibold">Agency Name</th>
                <th className="px-5 py-4 text-left font-semibold">Contact Person</th>
                <th className="px-5 py-4 text-left font-semibold">Email</th>
                <th className="px-5 py-4 text-left font-semibold">Phone</th>
                <th className="px-5 py-4 text-left font-semibold">City</th>
                <th className="px-5 py-4 text-left font-semibold">Registered</th>
                <th className="px-5 py-4 text-left font-semibold">Status</th>
                <th className="px-5 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                      Loading agents...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaUserShield className="text-4xl opacity-30" />
                      <p>No agents found</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((a, i) => (
                <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                  <td className="px-5 py-4">
                    <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg text-xs">{a.agentCode}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{a.agencyName || "-"}</td>
                  <td className="px-5 py-4 text-gray-600">{a.contactPerson || "-"}</td>
                  <td className="px-5 py-4 text-gray-600">{a.email}</td>
                  <td className="px-5 py-4 text-gray-600">{a.phone || "-"}</td>
                  <td className="px-5 py-4 text-gray-600">{a.city || "-"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{format(new Date(a.createdAt), "dd MMM yyyy")}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[a.status] || "bg-gray-100"}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {a.status === "PENDING" && (
                        <>
                          <button onClick={() => updateStatus(a.id, "ACTIVE")}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 flex items-center gap-1.5 transition-all hover:shadow-md" title="Approve">
                            <FaCheck className="text-[10px]" /> Approve
                          </button>
                          <button onClick={() => updateStatus(a.id, "REJECTED")}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 flex items-center gap-1.5 transition-all hover:shadow-md" title="Reject">
                            <FaTimes className="text-[10px]" /> Reject
                          </button>
                        </>
                      )}
                      {a.status === "ACTIVE" && (
                        <button onClick={() => updateStatus(a.id, "INACTIVE")}
                          className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 flex items-center gap-1.5 transition-all hover:shadow-md" title="Deactivate">
                          <FaBan className="text-[10px]" /> Deactivate
                        </button>
                      )}
                      {(a.status === "INACTIVE" || a.status === "REJECTED") && (
                        <button onClick={() => updateStatus(a.id, "ACTIVE")}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 flex items-center gap-1.5 transition-all hover:shadow-md" title="Activate">
                          <FaUserCheck className="text-[10px]" /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {Dialog}
    </div>
  );
};

export default Agents;
