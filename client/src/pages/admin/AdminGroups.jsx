import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaPlane } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const categoryOptions = [
  { value: "UMRAH", label: "Umrah" },
  { value: "UAE_ONE_WAY", label: "UAE One Way" },
  { value: "KSA_ONE_WAY", label: "KSA One Way" },
  { value: "OMAN_ONE_WAY", label: "Oman One Way" },
  { value: "UK_ONE_WAY", label: "UK One Way" },
];

const emptyLeg = { flightNumber: "", origin: "", destination: "", departureDate: "", departureTime: "", arrivalTime: "", baggage: "" };

const emptyForm = {
  groupName: "", category: "UMRAH", airlineId: "", sectorId: "",
  departureDate: "", returnDate: "", totalSeats: "", availableSeats: "",
  adultPrice: "", childPrice: "", infantPrice: "", status: "ACTIVE",
  flightLegs: [{ ...emptyLeg }],
};

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  useEffect(() => { loadAll(); }, [categoryFilter]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const params = categoryFilter ? { category: categoryFilter } : {};
      const [gRes, aRes, sRes] = await Promise.all([
        adminAPI.getAdminGroups(params),
        adminAPI.getAirlines(),
        adminAPI.getSectors(),
      ]);
      setGroups(gRes.data.groups || []);
      setAirlines(aRes.data.airlines || (Array.isArray(aRes.data) ? aRes.data : []));
      setSectors(sRes.data.sectors || (Array.isArray(sRes.data) ? sRes.data : []));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ ...emptyForm, flightLegs: [{ ...emptyLeg }] });
    setEditing(null);
    setModal(true);
  };

  const openEdit = (g) => {
    setForm({
      groupName: g.groupName || "", category: g.category || "UMRAH",
      airlineId: g.airlineId?.toString() || "", sectorId: g.sectorId?.toString() || "",
      departureDate: g.departureDate ? format(new Date(g.departureDate), "yyyy-MM-dd") : "",
      returnDate: g.returnDate ? format(new Date(g.returnDate), "yyyy-MM-dd") : "",
      totalSeats: g.totalSeats?.toString() || "", availableSeats: g.availableSeats?.toString() || "",
      adultPrice: g.adultPrice?.toString() || "", childPrice: g.childPrice?.toString() || "",
      infantPrice: g.infantPrice?.toString() || "", status: g.status || "ACTIVE",
      flightLegs: g.flightLegs?.length > 0 ? g.flightLegs.map((leg) => ({
        flightNumber: leg.flightNumber || "", origin: leg.origin || "",
        destination: leg.destination || "",
        departureDate: leg.departureDate ? format(new Date(leg.departureDate), "yyyy-MM-dd") : "",
        departureTime: leg.departureTime || "", arrivalTime: leg.arrivalTime || "",
        baggage: leg.baggage || "",
      })) : [{ ...emptyLeg }],
    });
    setEditing(g);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.airlineId || !form.sectorId) return toast.error("Airline and Sector required");
    if (!form.totalSeats || !form.adultPrice) return toast.error("Seats and adult price required");
    if (!form.flightLegs[0].flightNumber) return toast.error("At least one flight leg required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateGroup(editing.id, form);
        toast.success("Group updated!");
      } else {
        await adminAPI.createGroup(form);
        toast.success("Group created!");
      }
      setModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({ title: "Deactivate Group", message: `Deactivate group "${name}"? It will no longer be visible to agents.`, confirmLabel: "Deactivate" });
    if (!ok) return;
    try {
      await adminAPI.deleteGroup(id);
      toast.success("Group deactivated");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  const addLeg = () => setForm({ ...form, flightLegs: [...form.flightLegs, { ...emptyLeg }] });
  const removeLeg = (i) => setForm({ ...form, flightLegs: form.flightLegs.filter((_, idx) => idx !== i) });
  const updateLeg = (i, field, value) => {
    const legs = [...form.flightLegs];
    legs[i] = { ...legs[i], [field]: value };
    setForm({ ...form, flightLegs: legs });
  };

  const categoryBadge = (cat) => {
    const map = {
      UMRAH: "bg-green-100 text-green-800",
      UAE_ONE_WAY: "bg-blue-100 text-blue-800",
      KSA_ONE_WAY: "bg-purple-100 text-purple-800",
      OMAN_ONE_WAY: "bg-orange-100 text-orange-800",
      UK_ONE_WAY: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${map[cat] || "bg-gray-100"}`}>{cat?.replace(/_/g, " ")}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Flight Groups</h1>
        <div className="flex gap-3">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded text-sm">
            <option value="">All Categories</option>
            {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
            <FaPlus /> Add Group
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Group Name</th>
              <th className="px-3 py-3 text-left">Airline</th>
              <th className="px-3 py-3 text-left">Sector</th>
              <th className="px-3 py-3 text-left">Category</th>
              <th className="px-3 py-3 text-left">Departure</th>
              <th className="px-3 py-3 text-center">Seats</th>
              <th className="px-3 py-3 text-right">Adult Price</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Bookings</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-400">No groups found</td></tr>
            ) : groups.map((g, i) => (
              <tr key={g.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-semibold">{g.groupName || `AG-${g.id}`}</td>
                <td className="px-3 py-2">{g.airline?.name}</td>
                <td className="px-3 py-2">{g.sector?.routeDisplay}</td>
                <td className="px-3 py-2">{categoryBadge(g.category)}</td>
                <td className="px-3 py-2 text-xs">{g.departureDate ? format(new Date(g.departureDate), "dd MMM yyyy") : "-"}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`font-bold ${g.availableSeats < 5 ? "text-red-600" : "text-green-700"}`}>{g.availableSeats}</span>
                  <span className="text-gray-400">/{g.totalSeats}</span>
                </td>
                <td className="px-3 py-2 text-right font-bold">PKR {Number(g.adultPrice).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${g.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">{g._count?.bookings || 0}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(g)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><FaEdit /></button>
                    <button onClick={() => handleDelete(g.id, g.groupName || `AG-${g.id}`)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t text-sm text-gray-500">Total: {groups.length} groups</div>
      </div>

      {modal && (
        <AdminModal title={editing ? "Edit Flight Group" : "Create Flight Group"} onClose={() => setModal(false)} onSubmit={handleSave} submitting={submitting} size="xl">
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input value={form.groupName} onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. PIA Umrah Group Jan 2025" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airline *</label>
                <select value={form.airlineId} onChange={(e) => setForm({ ...form, airlineId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select Airline</option>
                  {airlines.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector / Route *</label>
                <select value={form.sectorId} onChange={(e) => setForm({ ...form, sectorId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select Sector</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.routeDisplay}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                <input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                <input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            {/* Seats & Pricing */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
                <input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value, availableSeats: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
                <input type="number" value={form.availableSeats} onChange={(e) => setForm({ ...form, availableSeats: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adult Price (PKR) *</label>
                <input type="number" value={form.adultPrice} onChange={(e) => setForm({ ...form, adultPrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 75000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child Price (PKR)</label>
                <input type="number" value={form.childPrice} onChange={(e) => setForm({ ...form, childPrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 50000" />
              </div>
            </div>

            {/* Status */}
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Flight Legs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-700 flex items-center gap-2"><FaPlane /> Flight Legs</h4>
                <button type="button" onClick={addLeg}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center gap-1">
                  <FaPlus /> Add Leg
                </button>
              </div>
              <div className="space-y-3">
                {form.flightLegs.map((leg, i) => (
                  <div key={i} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary">Leg {i + 1}</span>
                      {form.flightLegs.length > 1 && (
                        <button type="button" onClick={() => removeLeg(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Flight #</label>
                        <input value={leg.flightNumber} onChange={(e) => updateLeg(i, "flightNumber", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                          placeholder="e.g. PK-701" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">From</label>
                        <input value={leg.origin} onChange={(e) => updateLeg(i, "origin", e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                          placeholder="KHI" maxLength={4} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">To</label>
                        <input value={leg.destination} onChange={(e) => updateLeg(i, "destination", e.target.value.toUpperCase())}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                          placeholder="JED" maxLength={4} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Dep Date</label>
                        <input type="date" value={leg.departureDate} onChange={(e) => updateLeg(i, "departureDate", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Dep Time</label>
                        <input type="time" value={leg.departureTime} onChange={(e) => updateLeg(i, "departureTime", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Arr Time</label>
                        <input type="time" value={leg.arrivalTime} onChange={(e) => updateLeg(i, "arrivalTime", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Baggage</label>
                        <input value={leg.baggage} onChange={(e) => updateLeg(i, "baggage", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                          placeholder="25 KG" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default AdminGroups;
