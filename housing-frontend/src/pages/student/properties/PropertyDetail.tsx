import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import { fetchUnitsByProperty, resetUnits } from "../../../app/slices/unitSlice"; // Added resetUnits
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  MapPin, 
  ChevronLeft, 
  Building2, 
  Loader2, 
  Calendar, 
  LayoutGrid, 
  ArrowRight,
  ShieldCheck,
  Inbox
} from "lucide-react";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedProperty, loading: propertyLoading } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitsLoading } = useSelector((state: RootState) => state.units);
  const token = useSelector((state: RootState) => state.auth.token);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Filter units strictly by the property ID from the URL
  const filteredUnits = units.filter(
    (unit: any) => Number(unit.propertyId || unit.property_id) === Number(id)
  );

  useEffect(() => {
    if (id && token) {
      const propertyId = Number(id);
      
      // Clear old data first so we don't see previous property units
      dispatch(resetUnits()); 
      
      dispatch(fetchPropertyById(propertyId));
      dispatch(fetchUnitsByProperty(propertyId));
    }
  }, [dispatch, id, token]);

  if (propertyLoading || unitsLoading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#FDFDFF]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-slate-400 font-medium animate-pulse">Loading residence details...</p>
    </div>
  );

  if (!selectedProperty) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">
      Residence not found.
    </div>
  );

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link 
          to={`/${userRole}/properties`} 
          className="group inline-flex items-center text-slate-400 hover:text-blue-600 font-bold transition mb-10"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: Property Info & Units */}
          <div className="lg:col-span-2 space-y-10">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100">
                <ShieldCheck size={12} /> Verified Residence
              </div>
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">{selectedProperty.name}</h1>
              <div className="flex items-center text-slate-500 text-lg">
                <MapPin size={20} className="mr-2 text-blue-500" /> {selectedProperty.location}
              </div>
            </header>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4">About this Property</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-normal">
                {selectedProperty.description || "Sophisticated student living experience featuring modern amenities and strategic proximity to academic hubs."}
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Available Units</h3>
                <span className="text-sm font-medium text-slate-400">{filteredUnits.length} units found</span>
              </div>

              {filteredUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUnits.map((unit: any) => (
                    <div key={unit.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <LayoutGrid size={20} />
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${
                          unit.isAvailable ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          {unit.isAvailable ? "AVAILABLE" : "OCCUPIED"}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-xl">Unit {unit.unitNumber}</h4>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        Ksh {Number(unit.price).toLocaleString()}
                        <span className="text-sm text-slate-400 font-medium"> / mo</span>
                      </p>

                      <button
                        disabled={!unit.isAvailable}
                        onClick={() => navigate(`/student/properties/${selectedProperty.id}/book?unitId=${unit.id}`)}
                        className={`mt-6 w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          unit.isAvailable 
                          ? "bg-slate-900 text-white hover:bg-blue-600 shadow-lg" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {unit.isAvailable ? <>Secure this Unit <ArrowRight size={16}/></> : "Not Available"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
                   <div className="bg-slate-50 p-4 rounded-full text-slate-300 mb-4">
                      <Inbox size={40} />
                   </div>
                   <h4 className="text-lg font-bold text-slate-900">No units listed</h4>
                   <p className="text-slate-400 max-w-xs mx-auto">This property currently has no rooms available for booking.</p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Sidebar Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-900 text-lg mb-6">Property Overview</h4>
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium flex items-center gap-2"><Calendar size={16}/> Listed Date</span>
                    <span className="font-bold text-slate-700">
                        {selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium flex items-center gap-2"><Building2 size={16}/> Total Capacity</span>
                    <span className="font-bold text-slate-700">{filteredUnits.length} Units</span>
                  </div>
                  <div className="pt-5 border-t border-slate-50">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                      <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1">Student Guarantee</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Verified by the Housing Administration. Standard lease terms apply.</p>
                    </div>
                  </div>
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