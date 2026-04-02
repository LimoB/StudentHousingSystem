import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import { fetchUnits } from "../../../app/slices/unitSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  MapPin, 
  Loader2, 
  ArrowRight,
  Inbox,
  Image as ImageIcon
} from "lucide-react";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { properties, loading: propLoading } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitsLoading } = useSelector((state: RootState) => state.units);
  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'student';

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
  }, [dispatch]);

  // Memoized processing to handle image availability and occupancy logic
  const processedProperties = useMemo(() => {
    return properties.map((property: any) => {
      const propertyUnits = property.units || units.filter((u: any) => {
        const uPid = u.propertyId || u.property_id || u.property?.id;
        return Number(uPid) === Number(property.id);
      });

      const unitCount = propertyUnits.length || 0;
      const availableCount = propertyUnits.filter((u: any) => 
        u.isAvailable === true || u.isAvailable === "true" || u.isAvailable === 1
      ).length;

      const isSoldOut = property.status === "occupied" || (unitCount > 0 && availableCount === 0);

      return {
        ...property,
        unitCount,
        availableCount,
        isSoldOut,
        hasUnits: unitCount > 0,
        // Ensure we have a valid image reference
        displayImage: property.imageUrl || null 
      };
    });
  }, [properties, units]);

  if (propLoading && properties.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#FDFDFF]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Synchronizing Registry...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-blue-600 font-black text-[10px] tracking-[0.3em] uppercase">Premium Residencies</span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Curated <span className="text-slate-400 italic font-light">Living.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-slate-600 font-black text-[10px] uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            {properties.length} Estates Verified
          </div>
        </header>

        {properties.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-sm">
            <Inbox className="mx-auto text-slate-100 mb-6" size={64} />
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Registry Empty</h3>
            <p className="text-slate-400 font-medium mt-2">Check back later for new student listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {processedProperties.map((property: any) => (
              <div
                key={property.id}
                className={`group relative bg-white rounded-[3rem] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 flex flex-col ${
                  property.isSoldOut ? "grayscale-[0.5]" : ""
                }`}
              >
                {/* Image Header with Cloudinary Support */}
                <div className="h-64 relative overflow-hidden bg-slate-100">
                  {property.displayImage ? (
                    <img 
                      src={property.displayImage} 
                      alt={property.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-blue-900 flex items-center justify-center">
                      <ImageIcon className="text-white/10" size={48} />
                    </div>
                  )}
                  
                  {/* Status Badge Over Image */}
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border backdrop-blur-md ${
                      property.isSoldOut 
                      ? "bg-white/20 text-white border-white/20" 
                      : "bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20"
                    }`}>
                      {property.isSoldOut ? "Fully Leased" : "Vacancies Open"}
                    </span>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase">
                        {property.name}
                      </h2>
                      <div className="flex items-center text-slate-400 font-black text-[10px] uppercase tracking-widest">
                        <MapPin size={12} className="mr-1 text-blue-500" />
                        {property.location}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-8">
                    {property.description || "Sophisticated student living spaces designed for academic excellence."}
                  </p>

                  <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest">Availability</p>
                      <div className={`text-sm font-black uppercase tracking-tight ${property.isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>
                        {unitsLoading && units.length === 0 && !property.units ? (
                           <span className="text-slate-200 animate-pulse">Scanning...</span>
                        ) : property.hasUnits ? (
                           property.isSoldOut ? "Waitlist Only" : `${property.availableCount} Units Left`
                        ) : (
                           "Registration Pending"
                        )}
                      </div>
                    </div>
                    
                    <Link
                      to={`/${userRole}/properties/${property.id}`}
                      className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                        property.isSoldOut 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-100 hover:shadow-blue-200"
                      }`}
                    >
                      {property.isSoldOut ? "Sold Out" : "Explore"}
                      <ArrowRight size={14} strokeWidth={3} />
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