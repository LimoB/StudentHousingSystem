import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import { fetchUnits } from "../../../app/slices/unitSlice"; // Import fetchUnits
import type { RootState, AppDispatch } from "../../../app/store";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get Properties
  const { properties, loading: propLoading, error: propError } = useSelector(
    (state: RootState) => state.properties
  );

  // Get Units to calculate counts
  const { units, loading: unitsLoading } = useSelector(
    (state: RootState) => state.units
  );

  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits()); // Fetch all units to count them per property
  }, [dispatch]);

  if (!userRole) return <p className="p-6 text-red-500 text-center">You must be logged in to view properties.</p>;
  
  // Show loading if either properties or units are loading
  if (propLoading || unitsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-blue-600 font-medium">Loading properties...</p>
      </div>
    );
  }

  if (propError) return <p className="p-6 text-red-500 text-center font-bold">{propError}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Available Housing</h1>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
            Total Listings: {properties.length}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border">
            <p className="text-gray-400 text-lg">No properties available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: any) => {
              // Calculate the unit count for THIS property from the units slice
              const propertyUnits = units.filter((u: any) => u.propertyId === property.id);
              const unitCount = propertyUnits.length;

              return (
                <div
                  key={property.id}
                  className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-800 leading-tight">{property.name}</h2>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                        property.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-500 text-sm flex items-center mb-4">
                      <span className="mr-1">📍</span> {property.location}
                    </p>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-8 italic">
                      {property.description || "Beautiful student housing close to campus amenities."}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Capacity</span>
                        <span className="text-lg font-black text-blue-600">
                          {unitCount} {unitCount === 1 ? 'Unit' : 'Units'} Available
                        </span>
                      </div>
                      
                      <Link
                        to={`/${userRole}/properties/${property.id}`}
                        className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-lg active:scale-95"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;