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
    if (selectedProperty?.units && Array.isArray(selectedProperty.units)) {
      return selectedProperty.units;
    }
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
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Syncing Residence Ledger...</p>
    </div>
  );

  if (!selectedProperty) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <Inbox size={48} className="text-slate-200 mb-4" />
      <h2 className="text-slate-900 font-black uppercase tracking-tight text-xl">Residence Not Found</h2>
      <Link to={`/${userRole}/properties`} className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
        Return to Listings
      </Link>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Image Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-slate-900 overflow-hidden">
        {selectedProperty.imageUrl ? (
          <img 
            src={selectedProperty.imageUrl} 
            alt={selectedProperty.name} 
            className="w-full h-full object-cover opacity-70 transition-transform duration-1000 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-blue-900 flex items-center justify-center">
            <ImageIcon className="text-white/10" size={80} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent" />
        
        {/* Floating Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Registry
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-10">
            <header className="space-y-4 bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black tracking-widest uppercase border border-emerald-100">
                <ShieldCheck size={12} /> Verified Listing
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                {selectedProperty.name}
              </h1>
              <div className="flex items-center text-slate-400 font-black text-xs uppercase tracking-widest">
                <MapPin size={18} className="mr-2 text-blue-500" /> {selectedProperty.location}
              </div>
            </header>

            <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Asset Overview</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">
                {selectedProperty.description || "An exclusive student residence offering proximity to academic centers and premium security features."}
              </p>
            </section>

            <section className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Available Inventory</h3>
                <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {filteredUnits.length} Units Registered
                </span>
              </div>

              {filteredUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredUnits.map((unit: any) => {
                    const isAvailable = (unit.isAvailable === true || unit.isAvailable === 1 || unit.isAvailable === "true");
                    return (
                      <div key={unit.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-100/50 group">
                        <div className="flex justify-between items-center mb-8">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <LayoutGrid size={24} />
                          </div>
                          <span className={`px-4 py-1.5 text-[9px] font-black tracking-widest rounded-xl border ${
                            isAvailable 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-slate-50 text-slate-400 border-slate-100"
                          }`}>
                            {isAvailable ? "READY TO LEASE" : "OCCUPIED"}
                          </span>
                        </div>
                        
                        <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tight">Unit {unit.unitNumber}</h4>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-blue-600 font-black text-xs uppercase tracking-widest">KES</span>
                          <span className="text-3xl font-black text-slate-900">{Number(unit.price).toLocaleString()}</span>
                          <span className="text-xs text-slate-400 font-black uppercase tracking-widest ml-1">/ month</span>
                        </div>

                        <button
                          disabled={!isAvailable}
                          onClick={() => navigate(`/student/properties/${id}/book?unitId=${unit.id}`)}
                          className={`mt-8 w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                            isAvailable
                            ? "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200 hover:shadow-blue-200" 
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                          }`}
                        >
                          {isAvailable ? <>Secure Placement <ArrowRight size={14} strokeWidth={3}/></> : "Inventory Locked"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center">
                   <Inbox size={48} className="text-slate-100 mb-4" />
                   <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Active Inventory</h4>
                   <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto">This property has not yet registered individual units for booking.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-[0.3em] mb-8">Asset Details</h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" /> Registry Date
                    </span>
                    <span className="font-black text-slate-900 text-[10px] uppercase">
                        {selectedProperty.createdAt ? new Date(selectedProperty.createdAt).toLocaleDateString() : 'Verified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={14} className="text-blue-500" /> Class
                    </span>
                    <span className="font-black text-slate-900 text-[10px] uppercase">Premium Resident</span>
                  </div>
                  
                  <div className="pt-8 border-t border-slate-50">
                    <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-2">Booking Support</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
                        Payments are processed securely. Contact Housing Support for onsite tours.
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