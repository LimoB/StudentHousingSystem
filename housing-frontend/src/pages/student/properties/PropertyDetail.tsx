import { useEffect, useMemo } from "react"; 
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import { fetchUnitsByProperty, resetUnits } from "../../../app/slices/unitSlice";
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
  Inbox,
  Image as ImageIcon
} from "lucide-react";

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedProperty, loading: propertyLoading } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitsLoading } = useSelector((state: RootState) => state.units);
  const token = useSelector((state: RootState) => state.auth.token);
  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'student';

  const filteredUnits = useMemo(() => {
    // Priority 1: Units attached to the property object
    if (selectedProperty?.units && Array.isArray(selectedProperty.units)) {
      return selectedProperty.units;
    }
    // Priority 2: Units from the global units state filtered by property ID
    return units.filter((unit: any) => {
      const uPid = unit.propertyId || unit.property_id || unit.property?.id;
      return Number(uPid) === Number(id);
    });
  }, [selectedProperty, units, id]);

  useEffect(() => {
    if (id && token) {
      const propertyId = Number(id);
      dispatch(resetUnits()); 
      dispatch(fetchPropertyById(propertyId));
      dispatch(fetchUnitsByProperty(propertyId));
    }
  }, [dispatch, id, token]);

  if (propertyLoading || unitsLoading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#FDFDFF]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Syncing Residence Ledger...</p>
    </div>
  );

  if (!selectedProperty) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="p-8 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center">
        <Inbox size={48} className="text-slate-200 mb-6" />
        <h2 className="text-slate-900 font-black uppercase tracking-tight text-xl">Residence Not Found</h2>
        <Link to={`/${userRole}/properties`} className="mt-6 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
          Return to Listings
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Image Section */}
      <div className="relative h-[45vh] md:h-[55vh] w-full bg-slate-900 overflow-hidden">
        {selectedProperty.imageUrl ? (
          <img 
            src={selectedProperty.imageUrl} 
            alt={selectedProperty.name} 
            className="w-full h-full object-cover opacity-80 transition-transform duration-1000 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-blue-900 flex items-center justify-center">
            <ImageIcon className="text-white/10" size={100} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-black/20 to-transparent" />
        
        {/* Floating Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-2xl"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Registry
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-32 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-12">
            <header className="space-y-6 bg-white/90 backdrop-blur-2xl p-10 md:p-12 rounded-[3.5rem] border border-white shadow-2xl shadow-slate-200/60">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black tracking-widest uppercase border border-emerald-100">
                <ShieldCheck size={14} strokeWidth={3} /> Verified Housing Asset
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
                  {selectedProperty.name}
                </h1>
                <div className="flex items-center text-slate-400 font-black text-[11px] uppercase tracking-[0.15em] mt-6 bg-slate-50 w-fit px-4 py-2 rounded-full border border-slate-100">
                  <MapPin size={16} className="mr-2 text-blue-500" /> {selectedProperty.location}
                </div>
              </div>
            </header>

            <section className="bg-white p-10 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-blue-50/50 transition-colors">
                <Building2 size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Asset Intelligence</h3>
                <p className="text-slate-600 leading-relaxed text-xl font-medium max-w-2xl">
                  {selectedProperty.description || "An exclusive student residence offering proximity to academic centers and premium security features."}
                </p>
              </div>
            </section>

            {/* Inventory Grid */}
            <section className="space-y-10">
              <div className="flex items-center justify-between px-6">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Active Inventory</h3>
                <div className="flex items-center gap-3">
                    <span className="bg-white border border-slate-100 text-slate-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {filteredUnits.length} Units Registered
                    </span>
                </div>
              </div>

              {filteredUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {filteredUnits.map((unit: any) => {
                    const isAvailable = (unit.isAvailable === true || unit.isAvailable === 1 || String(unit.isAvailable) === "true");
                    
                    return (
                      <div key={unit.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-900/5 group flex flex-col overflow-hidden">
                        
                        {/* Unit Image / Visual */}
                        <div className="h-56 w-full bg-slate-50 relative overflow-hidden">
                          {unit.imageUrl ? (
                             <img src={unit.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <ImageIcon size={48} strokeWidth={1} />
                            </div>
                          )}
                          <div className={`absolute top-6 right-6 px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase border backdrop-blur-md ${
                            isAvailable 
                            ? "bg-emerald-500/90 text-white border-emerald-400" 
                            : "bg-slate-900/80 text-white/50 border-slate-700"
                          }`}>
                            {isAvailable ? "Available" : "Leased"}
                          </div>
                        </div>

                        <div className="p-10 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter">Unit {unit.unitNumber}</h4>
                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                                    <LayoutGrid size={12} /> {unit.size || unit.type || "Standard Plan"}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Monthly Rate</span>
                                <div className="flex items-center justify-end gap-1">
                                    <span className="text-blue-600 font-black text-[10px] uppercase">KES</span>
                                    <span className="text-2xl font-black text-slate-900">{Number(unit.price).toLocaleString()}</span>
                                </div>
                            </div>
                          </div>

                          <button
                            disabled={!isAvailable}
                            onClick={() => navigate(`/student/properties/${id}/book?unitId=${unit.id}`)}
                            className={`mt-auto w-full py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 border ${
                              isAvailable
                              ? "bg-slate-900 text-white hover:bg-blue-600 border-slate-900 hover:border-blue-600 shadow-xl shadow-slate-200 hover:shadow-blue-100" 
                              : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                            }`}
                          >
                            {isAvailable ? <>Initialize Booking <ArrowRight size={14} strokeWidth={3}/></> : "Inventory Locked"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-24 rounded-[3.5rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Inbox size={32} className="text-slate-200" />
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Active Inventory</h4>
                   <p className="text-slate-400 font-medium mt-3 max-w-xs mx-auto text-sm">
                    This property has not yet registered specific units for online secure placement.
                   </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" /> Asset Meta
                </h4>
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                      <Calendar size={16} className="text-blue-500/50" /> Registry
                    </span>
                    <span className="font-black text-slate-900 text-[11px] uppercase tracking-tight">
                        {selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
                      <ShieldCheck size={16} className="text-blue-500/50" /> Status
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border border-blue-100">
                        Institutional
                    </span>
                  </div>
                  
                  <div className="pt-10 border-t border-slate-50">
                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/20">
                      <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">Placement Support</p>
                      <p className="text-xs text-white/70 font-medium leading-relaxed uppercase tracking-wide">
                        All leases are managed through the centralized portal. Security deposits are required to finalize placement.
                      </p>
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