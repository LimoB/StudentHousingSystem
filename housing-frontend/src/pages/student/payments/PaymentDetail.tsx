// import React, { useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPaymentById } from "../../app/slices/paymentSlice";
// import { RootState, AppDispatch } from "../../app/store";

// const PaymentDetail: React.FC = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch<AppDispatch>();

//   const { selectedPayment, loading } = useSelector(
//     (state: RootState) => state.payments
//   );

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchPaymentById(id));
//     }
//   }, [dispatch, id]);

//   if (loading) {
//     return <p className="p-6">Loading payment details...</p>;
//   }

//   if (!selectedPayment) {
//     return <p className="p-6">Payment not found.</p>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Payment Details</h1>

//       <div className="bg-white shadow rounded-lg p-6 space-y-2">
//         <p><strong>ID:</strong> {selectedPayment.id}</p>
//         <p><strong>User:</strong> {selectedPayment.user_id}</p>
//         <p><strong>Amount:</strong> ${selectedPayment.amount}</p>
//         <p><strong>Status:</strong> {selectedPayment.status}</p>
//         <p><strong>Payment Date:</strong> {selectedPayment.payment_date}</p>
//       </div>
//     </div>
//   );
// };

// export default PaymentDetail;
import { useParams } from "react-router-dom";

const PaymentDetail = () => {
  const { id } = useParams();

  const payment = {
    id,
    property: "Sunset Apartments",
    amount: 500,
    method: "M-Pesa",
    status: "Paid",
    date: "2026-03-08",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Details</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-3">
        <p>
          <strong>Property:</strong> {payment.property}
        </p>
        <p>
          <strong>Amount:</strong> ${payment.amount}
        </p>
        <p>
          <strong>Method:</strong> {payment.method}
        </p>
        <p>
          <strong>Status:</strong> {payment.status}
        </p>
        <p>
          <strong>Date:</strong> {payment.date}
        </p>
      </div>
    </div>
  );
};

export default PaymentDetail;