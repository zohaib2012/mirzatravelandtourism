import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { paymentAPI } from "../../services/api";

const BankDetails = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getBankAccounts()
      .then(({ data }) => setAccounts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Bank Details</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> / Bank Details
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 240 }}>
            {/* Bank Logo Header */}
            <div className="h-20 bg-gradient-to-r from-primary to-deepblue flex items-center justify-center"
              style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.2)" }}>
              {acc.logoUrl ? (
                <img src={acc.logoUrl} alt={acc.bankName} className="h-12 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-white">{acc.bankName.split(" ").map(w => w[0]).join("")}</span>
              )}
            </div>

            {/* Details */}
            <div className="p-3">
              <p className="text-sm mb-1">
                <b className="text-gray-500">Bank Name: </b>{acc.bankName}
              </p>
              <p className="text-sm mb-1">
                <b className="text-gray-500">Account Title: </b>{acc.accountTitle}
              </p>
              <p className="text-sm mb-1">
                <b className="text-gray-500">Account Number: </b>{acc.accountNumber}
              </p>
              <p className="text-sm mb-1">
                <b className="text-gray-500">IBN: </b>{acc.iban || ""}
              </p>
              {acc.branchAddress && (
                <p className="text-sm mb-1">
                  <b className="text-gray-500">Address: </b>{acc.branchAddress}
                </p>
              )}
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-3 text-center py-8 text-gray-400">No bank details available</div>
        )}
      </div>
    </div>
  );
};

export default BankDetails;
