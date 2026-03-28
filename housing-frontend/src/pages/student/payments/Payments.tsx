import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllPayments } from "../../../app/slices/paymentSlice";
import { RootState, AppDispatch } from "../../../app/store";
import {
  CreditCard,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  ReceiptText,
} from "lucide-react";

const Payments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 1. Get payments from state
  const {
    payments: allPayments,
    loading,
    error,
  } = useSelector((state: RootState) => state.payments);

  // 2. Get current logged-in user
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = user?.userId || (user as any)?.id;

  useEffect(() => {
    // Only fetch if a user is logged in
    if (currentUserId) {
      dispatch(fetchAllPayments());
    }
  }, [dispatch, currentUserId]);

  /**
   * 3. CLIENT-SIDE FILTER (Safety Layer)
   * Ensures even if the API returns a generic list, the UI only shows
   * records belonging to this specific student.
   */
  const studentPayments = useMemo(() => {
    return allPayments.filter(
      (p) => Number(p.studentId) === Number(currentUserId),
    );
  }, [allPayments, currentUserId]);

  if (loading)
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-6"></div>
        <p className="text-gray-500 font-bold text-lg">
          Syncing your transactions...
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Payment History
          </h1>
          <p className="text-gray-500 font-medium">
            Manage and track your M-Pesa housing payments
          </p>
        </div>
        <div className="bg-blue-600 px-6 py-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-3 text-white">
          <ReceiptText size={20} />
          <span className="font-bold">
            {studentPayments.length} Transactions
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">
                  Amount
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">
                  M-Pesa Receipt
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">
                  Date
                </th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-right">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {studentPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CreditCard size={48} className="mb-4" />
                      <p className="text-gray-500 font-bold">
                        No payments found in your account.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                studentPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            p.status === "paid"
                              ? "bg-green-100 text-green-600"
                              : p.status === "pending"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.status === "paid" ? (
                            <CheckCircle2 size={16} />
                          ) : p.status === "pending" ? (
                            <Clock size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}
                        </div>
                        <span
                          className={`text-sm font-black capitalize ${
                            p.status === "paid"
                              ? "text-green-600"
                              : p.status === "pending"
                                ? "text-orange-600"
                                : "text-red-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-black text-gray-900 text-lg">
                      Ksh {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-600">
                        {p.mpesaReceiptNumber || "WAITING..."}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-gray-500 font-medium">
                      {new Date(p.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-6 text-right">
                      <Link
                        to={`/student/payments/${p.id}`}
                        // Removed opacity-0 and group-hover:opacity-100
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm shadow-sm"
                      >
                        View <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-center text-gray-400 text-xs font-medium uppercase tracking-tighter">
        Securely processed via Safaricom Daraja API
      </p>
    </div>
  );
};

export default Payments;
