import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchLeaseById } from "../../app/slices/leaseSlice";
import type { RootState, AppDispatch } from "../../app/store";

import LeaseCard from "../../components/LeaseCard";

const LeaseDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedLease, loading, error } = useSelector(
    (state: RootState) => state.leases
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchLeaseById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) {
    return <p className="p-6">Loading lease details...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!selectedLease) {
    return <p className="p-6">Lease not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lease Details</h1>

      <LeaseCard lease={selectedLease} />
    </div>
  );
};

export default LeaseDetail;