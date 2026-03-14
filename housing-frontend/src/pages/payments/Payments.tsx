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