import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../../app/store";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, loading, error } = useSelector(
    (state: RootState) => state.properties
  );
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  if (!userRole) return <p className="p-6 text-red-500">You must be logged in to view properties.</p>;
  if (loading) return <p className="p-6 text-center text-blue-600">Loading properties...</p>;
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Properties</h1>

        {properties.length === 0 ? (
          <p className="text-center text-gray-600">No properties found at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: any) => (
              <div
                key={property.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{property.name}</h2>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      property.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">📍 {property.location}</p>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-6">
                    {property.description || "Beautiful property with modern amenities."}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-blue-600">
                      {property.units?.length || 0} Units Available
                    </span>
                    <Link
                      to={`/${userRole}/properties/${property.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;