// src/pages/landlord/units/Units.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../../../app/slices/propertySlice";
import { fetchUnits } from "../../../app/slices/unitSlice"; // 1. Added Unit Thunk
import { RootState, AppDispatch } from "../../../app/store";
import UnitCard from "../../../components/UnitCard";
import { HiOutlineSquaresPlus, HiOutlineHomeModern } from "react-icons/hi2";
import { Link } from "react-router-dom";

const Units: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 2. Get both properties and units from their respective slices
  const { properties, loading: propLoading, error: propError } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitLoading, error: unitError } = useSelector((state: RootState) => state.units);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | "all">("all");

  useEffect(() => {
    // 3. Dispatch both to ensure we have all data needed for the "Join"
    dispatch(fetchProperties());
    dispatch(fetchUnits());
  }, [dispatch]);

  // 4. THE FIX: Merge units into properties locally so the UI sees them
  const propertiesWithUnits = properties.map(property => ({
    ...property,
    // Map units from the unit slice that belong to this property ID
    currentUnits: units.filter((u: any) => u.propertyId === property.id)
  }));

  // Filter based on the "Tabs" selection
  const filteredProperties = selectedPropertyId === "all" 
    ? propertiesWithUnits 
    : propertiesWithUnits.filter(p => p.id === selectedPropertyId);

  const loading = propLoading || unitLoading;
  const error = propError || unitError;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Property Units</h1>
          <p className="text-gray-500 mt-1">Manage rooms categorized by hostel.</p>
        </div>
        <Link 
          to="/landlord/units/add"
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          <HiOutlineSquaresPlus className="w-5 h-5" />
          <span>Add New Unit</span>
        </Link>
      </div>

      {/* Property Selector (The "Tabs") */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedPropertyId("all")}
          className={`px-5 py-2 rounded-xl font-bold transition ${
            selectedPropertyId === "all" 
            ? "bg-gray-900 text-white" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Units
        </button>
        {properties.map((prop) => (
          <button
            key={prop.id}
            onClick={() => setSelectedPropertyId(prop.id)}
            className={`px-5 py-2 rounded-xl font-bold transition ${
              selectedPropertyId === prop.id 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {prop.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Grouped Display */}
      <div className="space-y-12">
        {filteredProperties.map((property) => (
          <section key={property.id} className="animate-in fade-in duration-500">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <HiOutlineHomeModern className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{property.name}</h2>
              {/* Correctly count the units from our merged 'currentUnits' array */}
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
                {property.currentUnits.length} Units
              </span>
            </div>

            {property.currentUnits && property.currentUnits.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {property.currentUnits.map((unit: any) => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No units found for this property.</p>
                <Link to="/landlord/units/add" className="text-blue-600 font-bold text-sm mt-2 inline-block">
                  + Add first unit to {property.name}
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Units;