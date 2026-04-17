import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaBox } from "react-icons/fa";
import AdminModal from "../../components/admin/AdminModal";
import { useConfirm } from "../../components/common/ConfirmDialog";

const emptyForm = {
  packageName: "", groupId: "", numDays: "", availableSeats: "",
  sharedPrice: "", doublePrice: "", triplePrice: "", quadPrice: "",
  departureDate: "", returnDate: "", status: "ACTIVE",
};

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pkgRes, grpRes] = await Promise.all([
        adminAPI.getAdminPackages(),
        adminAPI.getAdminGroups({}),
      ]);
      setPackages(pkgRes.data.packages || []);
      setGroups(grpRes.data.groups || []);
    } catch {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (pkg) => {
    setForm({
      packageName: pkg.packageName || "",
      groupId: pkg.groupId?.toString() || "",
      numDays: pkg.numDays?.toString() || "",
      availableSeats: pkg.availableSeats?.toString() || "",
      sharedPrice: pkg.sharedPrice?.toString() || "",
      doublePrice: pkg.doublePrice?.toString() || "",
      triplePrice: pkg.triplePrice?.toString() || "",
      quadPrice: pkg.quadPrice?.toString() || "",
      departureDate: pkg.departureDate ? format(new Date(pkg.departureDate), "yyyy-MM-dd") : "",
      returnDate: pkg.returnDate ? format(new Date(pkg.returnDate), "yyyy-MM-dd") : "",
      status: pkg.status || "ACTIVE",
    });
    setEditing(pkg);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.packageName.trim()) return toast.error("Package name required");
    if (!form.doublePrice) return toast.error("At least double room price required");
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updatePackage(editing.id, form);
        toast.success("Package updated!");
      } else {
        await adminAPI.createPackage(form);
        toast.success("Package created!");
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
    const ok = await confirm({ title: "Deactivate Package", message: `Deactivate package "${name}"? It will no longer be visible to agents.`, confirmLabel: "Deactivate" });
    if (!ok) return;
    try {
      await adminAPI.deletePackage(id);
      toast.success("Package deactivated");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  const f = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) });
  const inputCls = "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none";
  const label = (text) => <label className="block text-sm font-medium text-gray-700 mb-1">{text}</label>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Umrah Packages</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:opacity-90">
          <FaPlus /> Add Package
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Package Name</th>
              <th className="px-3 py-3 text-left">Flight Group</th>
              <th className="px-3 py-3 text-center">Days</th>
              <th className="px-3 py-3 text-center">Seats</th>
              <th className="px-3 py-3 text-right">Double (PKR)</th>
              <th className="px-3 py-3 text-right">Triple (PKR)</th>
              <th className="px-3 py-3 text-right">Quad (PKR)</th>
              <th className="px-3 py-3 text-left">Departure</th>
              <th className="px-3 py-3 text-center">Bookings</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="12" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan="12" className="px-4 py-8 text-center text-gray-400">No packages found</td></tr>
            ) : packages.map((pkg, i) => (
              <tr key={pkg.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <FaBox className="text-accent" />
                    {pkg.packageName}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  {pkg.group ? `${pkg.group.airline?.name} — ${pkg.group.sector?.routeDisplay}` : "-"}
                </td>
                <td className="px-3 py-2 text-center font-bold">{pkg.numDays || "-"}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`font-bold ${(pkg.availableSeats || 0) < 5 ? "text-red-600" : "text-green-700"}`}>
                    {pkg.availableSeats ?? "-"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-bold">{pkg.doublePrice ? Number(pkg.doublePrice).toLocaleString() : "-"}</td>
                <td className="px-3 py-2 text-right">{pkg.triplePrice ? Number(pkg.triplePrice).toLocaleString() : "-"}</td>
                <td className="px-3 py-2 text-right">{pkg.quadPrice ? Number(pkg.quadPrice).toLocaleString() : "-"}</td>
                <td className="px-3 py-2 text-xs">
                  {pkg.departureDate ? format(new Date(pkg.departureDate), "dd MMM yyyy") : "-"}
                </td>
                <td className="px-3 py-2 text-center">{pkg._count?.bookings || 0}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${pkg.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {pkg.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(pkg)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><FaEdit /></button>
                    <button onClick={() => handleDelete(pkg.id, pkg.packageName)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t text-sm text-gray-500">Total: {packages.length} packages</div>
      </div>

      {modal && (
        <AdminModal
          title={editing ? "Edit Package" : "Create Umrah Package"}
          onClose={() => setModal(false)}
          onSubmit={handleSave}
          submitting={submitting}
          size="xl"
        >
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                {label("Package Name *")}
                <input {...f("packageName")} className={inputCls} placeholder="e.g. Mirza 21-Day Umrah Package" />
              </div>
              <div>
                {label("Link to Flight Group")}
                <select {...f("groupId")} className={inputCls}>
                  <option value="">-- No flight group --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.groupName || `Group #${g.id}`} — {g.airline?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                {label("Status")}
                <select {...f("status")} className={inputCls}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                {label("Number of Days")}
                <input type="number" {...f("numDays")} className={inputCls} placeholder="e.g. 21" />
              </div>
              <div>
                {label("Available Seats")}
                <input type="number" {...f("availableSeats")} className={inputCls} placeholder="e.g. 40" />
              </div>
              <div>
                {label("Departure Date")}
                <input type="date" {...f("departureDate")} className={inputCls} />
              </div>
              <div>
                {label("Return Date")}
                <input type="date" {...f("returnDate")} className={inputCls} />
              </div>
            </div>

            {/* Room Pricing */}
            <div>
              <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Room Pricing (PKR per person)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  {label("Sharing Price")}
                  <input type="number" {...f("sharedPrice")} className={inputCls} placeholder="e.g. 120000" />
                </div>
                <div>
                  {label("Double Price *")}
                  <input type="number" {...f("doublePrice")} className={inputCls} placeholder="e.g. 140000" />
                </div>
                <div>
                  {label("Triple Price")}
                  <input type="number" {...f("triplePrice")} className={inputCls} placeholder="e.g. 130000" />
                </div>
                <div>
                  {label("Quad Price")}
                  <input type="number" {...f("quadPrice")} className={inputCls} placeholder="e.g. 120000" />
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
      {Dialog}
    </div>
  );
};

export default AdminPackages;
