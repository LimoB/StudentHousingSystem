import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchRequestById } from "../../../app/slices/maintenanceSlice";
import type { RootState, AppDispatch } from "../../../app/store";

import MaintenanceCard from "../../../components/MaintenanceCard";

const RequestDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedRequest, loading, error } = useSelector(
    (state: RootState) => state.maintenance
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchRequestById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) {
    return <p className="p-6">Loading request details...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!selectedRequest) {
    return <p className="p-6">Request not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Maintenance Request Details
      </h1>

      <MaintenanceCard request={selectedRequest} />
    </div>
  );
};

export default RequestDetail;