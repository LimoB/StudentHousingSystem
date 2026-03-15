// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPayments } from "../../app/slices/paymentSlice";
// import { RootState, AppDispatch } from "../../app/store";
// import PaymentCard from "../../components/PaymentCard";

// const Payments: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { payments, loading } = useSelector(
//     (state: RootState) => state.payments
//   );

//   useEffect(() => {
//     dispatch(fetchPayments());
//   }, [dispatch]);

//   if (loading) {
//     return <p className="p-6">Loading payments...</p>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Payments</h1>

//       {payments.length === 0 ? (
//         <p>No payments found.</p>
//       ) : (
//         <div className="grid gap-4">
//           {payments.map((payment: any) => (
//             <PaymentCard key={payment.id} payment={payment} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Payments;

const Payments = () => {
  const payments = [
    { id: 1, student: "John Doe", amount: 500, status: "Paid" },
    { id: 2, student: "Mary Kim", amount: 450, status: "Pending" },
    { id: 3, student: "Alex Mwangi", amount: 520, status: "Paid" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Payments</h1>

      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Student</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.student}</td>
                <td className="p-2">${p.amount}</td>
                <td className="p-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;