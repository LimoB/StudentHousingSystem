import type { Lease } from "../api/leases";

interface Props {
  lease: Lease;
  onDelete?: () => void;
  onEnd?: () => void;
}

const LeaseCard: React.FC<Props> = ({ lease, onDelete, onEnd }) => {
  const statusColor =
    lease.status === "active"
      ? "bg-green-100 text-green-700"
      : lease.status === "ended"
      ? "bg-gray-100 text-gray-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-white border rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">
          Lease #{lease.id}
        </h2>

        <span className={`px-3 py-1 rounded text-sm ${statusColor}`}>
          {lease.status}
        </span>
      </div>

      <p>
        <strong>Student:</strong> {lease.studentId}
      </p>

      <p>
        <strong>Unit:</strong> {lease.unitId}
      </p>

      <p>
        <strong>Start:</strong>{" "}
        {new Date(lease.startDate).toLocaleDateString()}
      </p>

      {lease.endDate && (
        <p>
          <strong>End:</strong>{" "}
          {new Date(lease.endDate).toLocaleDateString()}
        </p>
      )}

      <p>
        <strong>Created:</strong>{" "}
        {new Date(lease.createdAt).toLocaleDateString()}
      </p>

      <div className="flex gap-3 mt-4">
        {lease.status === "active" && onEnd && (
          <button
            onClick={onEnd}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
          >
            End Lease
          </button>
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

export default LeaseCard;