import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import { fetchUnitsByProperty } from "../../../app/slices/unitSlice";
import type { RootState, AppDispatch } from "../../../app/store";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // From propertySlice
  const { selectedProperty, loading: propertyLoading, error: propertyError } = useSelector(
    (state: RootState) => state.properties
  );

  // From unitSlice
  const { units, loading: unitsLoading, error: unitsError } = useSelector(
    (state: RootState) => state.units
  );

  const token = useSelector((state: RootState) => state.auth.token);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    if (id && token) {
      const propertyId = Number(id);
      dispatch(fetchPropertyById(propertyId));
      dispatch(fetchUnitsByProperty(propertyId));
    }
  }, [dispatch, id, token]);

  if (!token) return <p className="p-6 text-red-500 font-bold">Session expired. Please log in.</p>;
  
  if (propertyLoading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading details...</div>;
  if (propertyError) return <p className="p-6 text-red-500 text-center">{propertyError}</p>;
  if (!selectedProperty) return <p className="p-6 text-center text-gray-500">Property not found.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link 
          to={`/${userRole}/properties`} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition"
        >
          <span className="mr-2">←</span> Back to Available Listings
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Main Header Banner */}
        <div className="p-10 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-4xl font-black text-gray-900 mb-2">{selectedProperty.name}</h1>
          <div className="flex items-center text-gray-600 text-lg">
            <span className="mr-2">📍</span> {selectedProperty.location}
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description Section */}
            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">About this Property</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {selectedProperty.description || "No specific details provided by the landlord."}
              </p>
            </section>

            {/* Units Selection Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Available Units</h3>
                {unitsLoading && <span className="text-sm text-blue-500 animate-spin">⌛</span>}
              </div>

              {unitsError ? (
                <p className="text-red-400 italic">{unitsError}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {units && units.length > 0 ? (
                    units.map((unit: any) => (
                      <div 
                        key={unit.id} 
                        className="group p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-400 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-black text-gray-800 text-xl">Room {unit.unitNumber}</h4>
                              <p className="text-blue-600 font-bold text-lg mt-1">
                                Ksh {Number(unit.price).toLocaleString()}
                                <span className="text-xs text-gray-400 font-normal"> / month</span>
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              unit.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {unit.isAvailable ? "OPEN" : "TAKEN"}
                            </span>
                          </div>

                          {unit.isAvailable && (
                            <button
                              onClick={() => navigate(`/student/properties/${selectedProperty.id}/book?unitId=${unit.id}`)}
                              className="mt-auto w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg group-hover:scale-[1.02]"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                      No units are currently listed for this property.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Meta Info */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 sticky top-6">
              <h4 className="font-bold text-gray-900 text-xl mb-6">Property Stats</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm uppercase">
                    {selectedProperty.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-500">Listings</span>
                  <span className="font-bold text-gray-800">{units.length} Units</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Listed On</span>
                  <span className="font-bold text-gray-800">
                    {new Date(selectedProperty.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-400 font-bold uppercase mb-2">Student Support</p>
                <p className="text-sm text-gray-600 leading-snug">
                  Need help with this booking? Contact our student housing desk for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;