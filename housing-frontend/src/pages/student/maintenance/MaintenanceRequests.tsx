import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchMaintenanceRequests,
  fetchMyMaintenanceRequests,
  deleteMaintenanceRequestAction,
  updateMaintenanceStatusAction,
} from "../../../app/slices/maintenanceSlice";

import type { RootState, AppDispatch } from "../../../app/store";
import type { MaintenanceRequest } from "../../../api/maintenance";

import MaintenanceCard from "../../../components/MaintenanceCard";

const MaintenanceRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { requests, loading, error } = useSelector(
    (state: RootState) => state.maintenance
  );

  const user = useSelector<RootState, RootState["auth"]["user"]>(
    (state) => state.auth.user
  );

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(fetchMyMaintenanceRequests());
    } else {
      dispatch(fetchMaintenanceRequests());
    }
  }, [dispatch, user]);

  const handleDelete = (id: number) => {
    dispatch(deleteMaintenanceRequestAction(id));
  };

  const handleStatusChange = (id: number, status: string) => {
    dispatch(updateMaintenanceStatusAction({ id, status }));
  };

  if (loading) {
    return <p className="p-6">Loading maintenance requests...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Maintenance Requests</h1>

      {requests.length === 0 ? (
        <p>No maintenance requests found.</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request: MaintenanceRequest) => (
            <MaintenanceCard
              key={request.id}
              request={request}
              onDelete={() => handleDelete(request.id)}
              onUpdateStatus={(status) =>
                handleStatusChange(request.id, status)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequests;