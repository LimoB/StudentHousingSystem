// src/pages/landlord/properties/Properties.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../../app/store";
import PropertyCard from "../../../components/PropertyCard";
import { HiOutlinePlus, HiOutlineHomeModern } from "react-icons/hi2";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { properties, loading, error } = useSelector((state: RootState) => state.properties);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Properties</h1>
          <p className="text-gray-500 mt-1">Manage your hostels and track occupancy.</p>
        </div>
        <button 
          onClick={() => navigate("/landlord/properties/add")}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>Add New Property</span>
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading your portfolio...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {!loading && properties.length === 0 ? (
        <div className="bg-gray-50 rounded-[2.5rem] py-20 px-6 border-2 border-dashed border-gray-200 text-center">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm mb-6">
            <HiOutlineHomeModern className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No properties yet</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            Start by adding your first hostel to begin managing units and students.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;