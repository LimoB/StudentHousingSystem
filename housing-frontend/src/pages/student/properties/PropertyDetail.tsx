import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../../app/store";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedProperty, loading, error } = useSelector((state: RootState) => state.properties);
  const token = useSelector((state: RootState) => state.auth.token);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    if (id && token) {
      dispatch(fetchPropertyById(Number(id)));
    }
  }, [dispatch, id, token]);

  if (!token) return <p className="p-6 text-red-500">You must be logged in to view this property.</p>;
  if (loading) return <p className="p-6 text-center">Loading property details...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!selectedProperty) return <p className="p-6">Property not found.</p>;

  // Typecast to any to access the units relation from the backend
  const property = selectedProperty as any;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <Link to={`/${userRole}/properties`} className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Properties
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{property.name}</h1>
          <p className="text-gray-500 flex items-center gap-1">📍 {property.location}</p>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Description */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {property.description || "No description provided."}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Available Units</h3>
              <div className="grid gap-4">
                {property.units && property.units.length > 0 ? (
                  property.units.map((unit: any) => (
                    <div key={unit.id} className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Unit {unit.unitNumber}</h4>
                        <p className="text-blue-600 font-bold">Ksh {Number(unit.price).toLocaleString()}</p>
                      </div>
                      {userRole === "student" && unit.isAvailable ? (
                        <button
                          onClick={() => navigate(`/student/properties/${property.id}/book?unitId=${unit.id}`)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
                        >
                          Book Unit
                        </button>
                      ) : (
                        <span className="px-4 py-1 bg-gray-100 text-gray-400 rounded-lg text-sm italic">Unavailable</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No units available for this property.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Meta Info */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-4">Property Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-green-600 uppercase">{property.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Added:</span>
                  <span className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;