import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../app/store";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedProperty, loading, error } = useSelector(
    (state: RootState) => state.properties
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPropertyById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) {
    return <p className="p-6">Loading property details...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!selectedProperty) {
    return <p className="p-6">Property not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Property Details</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-3">
        <p><strong>ID:</strong> {selectedProperty.id}</p>
        <p><strong>Name:</strong> {selectedProperty.name}</p>
        <p><strong>Location:</strong> {selectedProperty.location}</p>
        <p><strong>Description:</strong> {selectedProperty.description}</p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(selectedProperty.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {new Date(selectedProperty.updatedAt).toLocaleDateString()}
        </p>

        <div className="mt-4 flex gap-3">
          <Link
            to={`/properties/${selectedProperty.id}/units`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Units
          </Link>
          <Link
            to={`/properties/edit/${selectedProperty.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Edit Property
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;