import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProperties } from "../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../app/store";
import PropertyCard from "../PropertyCard";
import { 
  HiOutlinePlus, 
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineMagnifyingGlass
} from "react-icons/hi2";
import { Property } from "../../api/properties";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { properties, loading } = useSelector((state: RootState) => state.properties);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const isAdmin = user?.role === 'admin';

  // 1. REFINED GROUPING LOGIC
  const groupedProperties = useMemo(() => {
    if (!properties || properties.length === 0) return {};
    
    // Create a local copy for filtering
    let filtered = [...properties];

    // Search Filter: Name or Location
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(lowSearch) || 
        p.location?.toLowerCase().includes(lowSearch)
      );
    }

    // Landlord Logic: Standardized to use property.landlordId
    if (!isAdmin) {
      const currentUserId = user?.userId;
      const myAssets = filtered.filter(p => p.landlordId === currentUserId);
      return myAssets.length > 0 ? { "My Portfolio": myAssets } : {};
    }

    // Admin Logic: Group by Landlord Name
    return filtered.reduce((acc: Record<string, Property[]>, prop) => {
      // Use the nested landlord object if available, otherwise fallback
      const landlordName = (prop as any).landlord?.fullName || (prop as any).landlordName || "Independent Owners";
      if (!acc[landlordName]) acc[landlordName] = [];
      acc[landlordName].push(prop);
      return acc;
    }, {});
  }, [properties, user, isAdmin, searchTerm]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
              isAdmin ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
            }`}>
              {isAdmin ? "Global Oversight" : "Portfolio Ledger"}
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isAdmin ? "Global Portfolio" : `Welcome, ${user?.fullName?.split(' ')[0] || 'User'}`}
          </h1>
          <p className="text-gray-400 font-bold text-[10px] mt-1 uppercase tracking-widest">
            Monitoring <span className="text-blue-600 font-black">{properties.length}</span> Active Managed Assets.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search properties..."
              className="bg-white border border-gray-100 pl-12 pr-6 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 w-64 transition-all placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => navigate(isAdmin ? "/admin/properties/add" : "/landlord/properties/add")}
            className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-gray-100 active:scale-95"
          >
            <HiOutlinePlus className="w-4 h-4 stroke-[4]" />
            <span>New Registry</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mb-4"></div>
           <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Syncing Registry...</p>
        </div>
      ) : Object.keys(groupedProperties).length === 0 ? (
        <div className="bg-white rounded-[3rem] py-24 px-6 border border-gray-100 text-center shadow-sm">
          <HiOutlineBuildingOffice2 className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Portfolio Empty</h2>
          <p className="text-gray-400 mt-2 font-bold text-sm mb-8">No properties found matching your search.</p>
          <button onClick={() => setSearchTerm("")} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Reset Search</button>
        </div>
      ) : (
        <div className="space-y-24">
          {Object.entries(groupedProperties).map(([landlordName, props]) => (
            <div key={landlordName} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Group Header */}
              <div className="sticky top-4 z-20 flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-gray-50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-900 rounded-xl text-white shadow-lg">
                     <HiOutlineUserGroup className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{landlordName}</h3>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Verified Provider • {props.length} Assets</p>
                  </div>
                </div>
              </div>

              {/* Property Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {props.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    viewOnly={isAdmin} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;