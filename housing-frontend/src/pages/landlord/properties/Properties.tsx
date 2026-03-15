import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProperties } from "../../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../../app/store";

import PropertyCard from "../../../components/PropertyCard";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { properties, loading, error } = useSelector(
    (state: RootState) => state.properties
  );

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  if (loading) {
    return <p className="p-6">Loading properties...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Properties</h1>

      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;