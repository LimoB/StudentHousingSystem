import type { MaintenanceRequest } from "../api/maintenance";

interface Props {
  request: MaintenanceRequest;
  onDelete?: () => void;
  onUpdateStatus?: (status: string) => void;
}

const MaintenanceCard: React.FC<Props> = ({
  request,
  onDelete,
  onUpdateStatus,
}) => {
  const statusColor =
    request.status === "completed"
      ? "bg-green-100 text-green-700"
      : request.status === "in_progress"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white border rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">
          Request #{request.id}
        </h2>

        <span className={`px-3 py-1 rounded text-sm ${statusColor}`}>
          {request.status}
        </span>
      </div>

      <p>
        <strong>Student:</strong> {request.studentId}
      </p>

      <p>
        <strong>Unit:</strong> {request.unitId}
      </p>

      <p>
        <strong>Description:</strong> {request.description}
      </p>

      <p>
        <strong>Created:</strong>{" "}
        {new Date(request.createdAt).toLocaleDateString()}
      </p>

      <div className="flex gap-3 mt-4">
        {onUpdateStatus && (
          <>
            <button
              onClick={() => onUpdateStatus("in_progress")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            >
              In Progress
            </button>

            <button
              onClick={() => onUpdateStatus("completed")}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Complete
            </button>
          </>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceCard;