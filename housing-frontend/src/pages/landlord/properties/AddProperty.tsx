// src/pages/properties/AddProperty.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createPropertyAction } from "../../../app/slices/propertySlice";
import { AppDispatch } from "../../../app/store";

const AddProperty: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Dispatch the async thunk
      const resultAction = await dispatch(
        createPropertyAction({ name, location, description })
      );

      // Check if it was fulfilled
      if (createPropertyAction.fulfilled.match(resultAction)) {
        setSuccess(true);
        setName("");
        setLocation("");
        setDescription("");
      } else {
        // rejected
        setError(resultAction.payload as string || "Failed to add property");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Property</h1>

      {error && (
        <p className="text-red-600 mb-2">Error: {error}</p>
      )}
      {success && (
        <p className="text-green-600 mb-2">Property added successfully!</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Property Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Property"}
        </button>
      </form>
    </div>
  );
};

export default AddProperty;