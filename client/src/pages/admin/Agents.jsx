import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaCheck, FaTimes, FaBan, FaUserCheck, FaSearch } from "react-icons/fa";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

const Agents = () => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState("");

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
    if (!confirm(`Are you sure you want to ${labels[status] || "update"} this agent?`)) return;
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
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Agent Management</h1>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded text-sm">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="flex">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agent..."
              className="px-3 py-2 border rounded-l text-sm outline-none" />
            <button className="px-3 py-2 bg-primary text-white rounded-r"><FaSearch /></button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">Agent Code</th>
              <th className="px-3 py-3 text-left">Agency Name</th>
              <th className="px-3 py-3 text-left">Contact Person</th>
              <th className="px-3 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-left">Phone</th>
              <th className="px-3 py-3 text-left">City</th>
              <th className="px-3 py-3 text-left">Registered</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">No agents found</td></tr>
            ) : filtered.map((a, i) => (
              <tr key={a.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 font-bold text-primary">{a.agentCode}</td>
                <td className="px-3 py-3">{a.agencyName || "-"}</td>
                <td className="px-3 py-3">{a.contactPerson || "-"}</td>
                <td className="px-3 py-3">{a.email}</td>
                <td className="px-3 py-3">{a.phone || "-"}</td>
                <td className="px-3 py-3">{a.city || "-"}</td>
                <td className="px-3 py-3 text-xs">{format(new Date(a.createdAt), "dd MMM yyyy")}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[a.status] || "bg-gray-100"}`}>{a.status}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {a.status === "PENDING" && (
                      <>
                        <button onClick={() => updateStatus(a.id, "ACTIVE")}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center gap-1" title="Approve">
                          <FaCheck /> Approve
                        </button>
                        <button onClick={() => updateStatus(a.id, "REJECTED")}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1" title="Reject">
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                    {a.status === "ACTIVE" && (
                      <button onClick={() => updateStatus(a.id, "INACTIVE")}
                        className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 flex items-center gap-1" title="Deactivate">
                        <FaBan /> Deactivate
                      </button>
                    )}
                    {(a.status === "INACTIVE" || a.status === "REJECTED") && (
                      <button onClick={() => updateStatus(a.id, "ACTIVE")}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center gap-1" title="Activate">
                        <FaUserCheck /> Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t text-sm text-gray-500">
          Showing {filtered.length} of {agents.length} agents
        </div>
      </div>
    </div>
  );
};

export default Agents;
