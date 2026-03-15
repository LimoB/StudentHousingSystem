import { useState } from "react";
import { useDispatch } from "react-redux";
import { createUnitAction } from "../../../app/slices/unitSlice";
import { AppDispatch } from "../../../app/store";

const AddUnit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("available"); // default status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !propertyId || !size) return;

    try {
      await dispatch(
        createUnitAction({
          name,
          propertyId: Number(propertyId),
          size,
          status,
        })
      ).unwrap(); // unwrap to catch errors

      // reset form
      setName("");
      setPropertyId("");
      setSize("");
      setStatus("available");
    } catch (err: any) {
      alert(err || "Failed to create unit");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Unit</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Unit Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Property ID"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Size (e.g., 2BHK)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Unit
        </button>
      </form>
    </div>
  );
};

export default AddUnit;