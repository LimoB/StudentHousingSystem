import { useState } from "react";
import { useDispatch } from "react-redux";
import { Unit } from "../api/units";
import { AppDispatch } from "../app/store";
import { updateUnitAction, deleteUnitAction } from "../app/slices/unitSlice";

interface UnitCardProps {
  unit: Unit;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(unit.name);
  const [size, setSize] = useState(unit.size);
  const [status, setStatus] = useState(unit.status);

  const handleUpdate = async () => {
    try {
      await dispatch(
        updateUnitAction({ id: unit.id, data: { name, size, status } })
      ).unwrap();
      setIsEditing(false);
    } catch (err: any) {
      alert(err || "Failed to update unit");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    try {
      await dispatch(deleteUnitAction(unit.id)).unwrap();
    } catch (err: any) {
      alert(err || "Failed to delete unit");
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-1 rounded"
          />
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full border p-1 rounded"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-1 rounded"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold">{unit.name}</h2>
          <p><strong>Property ID:</strong> {unit.propertyId}</p>
          <p><strong>Size:</strong> {unit.size}</p>
          <p><strong>Status:</strong> {unit.status}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(unit.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Updated: {new Date(unit.updatedAt).toLocaleDateString()}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UnitCard;