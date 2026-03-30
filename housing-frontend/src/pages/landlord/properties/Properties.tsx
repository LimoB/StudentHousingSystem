import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProperties } from "../../../app/slices/propertySlice";
import type { RootState, AppDispatch } from "../../../app/store";
import PropertyCard from "../../../components/PropertyCard";
import { 
  HiOutlinePlus, 
  HiOutlineHomeModern 
} from "react-icons/hi2";

const Properties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { properties, loading, error } = useSelector((state: RootState) => state.properties);
  const user = useSelector((state: RootState) => state.auth.user);

  /**
   * FILTER LOGIC
   * Using 'any' cast specifically for the ID check to satisfy the WritableDraft error.
   */
  const myProperties = useMemo(() => {
    if (!user) return [];
    
    // Admin sees all
    if (user.role === 'admin') return properties;
    
    // We cast to any here to stop the 'Property id does not exist' error
    // because we know the backend is sending 'id' from your console logs.
    const currentUserId = (user as any).id || (user as any).userId;

    const filtered = properties.filter(p => {
      // Loose equality (==) handles string vs number comparisons
      return p.landlordId == currentUserId;
    });

    console.log(`--- Sync: Found ${filtered.length} properties for ID ${currentUserId} ---`);
    return filtered;
  }, [properties, user]);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchProperties());
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
              Portfolio Overview
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Hi, {user?.fullName?.split(' ')[0] || 'Landlord'}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {loading ? (
              "Updating your dashboard..."
            ) : (
              <>You currently have <span className="text-blue-600 font-bold">{myProperties.length}</span> active properties.</>
            )}
          </p>
        </div>
        
        {user?.role !== 'student' && (
          <button 
            onClick={() => navigate("/landlord/properties/add")}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-[1.25rem] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95"
          >
            <HiOutlinePlus className="w-5 h-5 stroke-[3]" />
            <span>Add New Property</span>
          </button>
        )}
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center mb-10">
          <h2 className="text-xl font-bold text-red-900">Connection Error</h2>
          <p className="text-red-600/70 mb-4">{error}</p>
          <button onClick={handleRetry} className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-xl font-bold">
            Try Again
          </button>
        </div>
      )}

      {/* Property Grid / Empty State */}
      {loading && myProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
           <p className="mt-4 text-gray-500 font-bold">Syncing your assets...</p>
        </div>
      ) : !loading && myProperties.length === 0 ? (
        <div className="bg-gray-50 rounded-[3rem] py-24 px-6 border-2 border-dashed border-gray-200 text-center">
          <HiOutlineHomeModern className="w-12 h-12 text-gray-300 mx-auto mb-8" />
          <h2 className="text-2xl font-black text-gray-900">Start your journey</h2>
          <p className="text-gray-500 mt-3 max-w-sm mx-auto font-medium leading-relaxed">
            Your portfolio is empty. Add your first building to start managing units.
          </p>
          <button 
            onClick={() => navigate("/landlord/properties/add")}
            className="mt-8 text-blue-600 font-black hover:underline underline-offset-8"
          >
            + Create your first listing
          </button>
        </div>
      ) : (
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {myProperties.map((property) => (
            <div key={property.id} className="transform transition-all hover:-translate-y-2">
               <PropertyCard property={property} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;