import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeases } from "../../app/slices/leaseSlice";
import { RootState, AppDispatch } from "../../app/store";
import LeaseCard from "../../components/LeaseCard";

const Leases: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { leases, loading } = useSelector(
    (state: RootState) => state.leases
  );

  useEffect(() => {
    dispatch(fetchLeases());
  }, [dispatch]);

  if (loading) {
    return <p className="p-6">Loading leases...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leases</h1>

      {leases.length === 0 ? (
        <p>No leases found.</p>
      ) : (
        <div className="grid gap-4">
          {leases.map((lease: any) => (
            <LeaseCard key={lease.id} lease={lease} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;