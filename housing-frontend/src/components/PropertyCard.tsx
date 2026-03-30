import { useMemo } from "react";
import { 
  HiOutlineMapPin, 
  HiOutlineTrash, 
  HiOutlinePencilSquare,
  HiOutlineBuildingOffice
} from "react-icons/hi2";
import { Property } from "../api/properties";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { deletePropertyAction } from '../app/slices/propertySlice';
import { AppDispatch, RootState } from '../app/store';
import toast from "react-hot-toast";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // 1. SELECT raw data (stable reference)
  const allUnits = useSelector((state: RootState) => state.units.units);

  // 2. MEMOIZE the filtering (fixes the Redux warning)
  const propertyUnits = useMemo(() => {
    return allUnits.filter(u => u.propertyId === property.id);
  }, [allUnits, property.id]);

  // 3. Determine final count
  const unitCount = property.units?.length || propertyUnits.length || 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure? This will permanently delete "${property.name}" and all associated units.`)) return;

    const loadingToast = toast.loading(`Decommissioning ${property.name}...`);

    try {
      const result = await dispatch(deletePropertyAction(property.id));
      if (deletePropertyAction.fulfilled.match(result)) {
        toast.success("Property removed from portfolio", { id: loadingToast });
      } else {
        const errorMessage = result.payload as string || "Deletion failed";
        toast.error(errorMessage, { id: loadingToast });
      }
    } catch {
      toast.error("A network error occurred", { id: loadingToast });
    }
  };

  const handleManage = () => {
    navigate(`/landlord/properties/${property.id}`);
  };

  return (
    <div 
      onClick={handleManage}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden group cursor-pointer relative"
    >
      {/* Visual Header */}
      <div className="h-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-6 flex flex-col justify-between relative overflow-hidden">
        <HiOutlineBuildingOffice className="absolute -right-2 -bottom-2 w-24 h-24 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
        <div className="flex justify-between items-start relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1 text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
            {property.status || 'Verified'}
          </div>
        </div>
      </div>
      
      <div className="p-7">
        <div className="mb-6">
          <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
            {property.name}
          </h3>
          <div className="flex items-center text-xs text-gray-400 mt-2 font-bold tracking-tight">
            <HiOutlineMapPin className="mr-1 text-blue-500 w-4 h-4" /> 
            {property.location}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total Capacity</p>
            <p className={`text-2xl font-black ${unitCount > 0 ? 'text-gray-900' : 'text-gray-200'}`}>
              {unitCount.toString().padStart(2, '0')} <span className="text-[10px] text-gray-400 font-medium">Units</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Property Health</p>
            <div className="flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-black text-green-600 uppercase tracking-tighter">Operational</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); handleManage(); }}
            className="flex-1 bg-gray-900 text-white hover:bg-blue-600 py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center shadow-lg shadow-gray-100 hover:shadow-blue-200"
          >
            <HiOutlinePencilSquare className="mr-2 w-4 h-4" /> 
            Manage Assets
          </button>
          
          <button 
            onClick={handleDelete}
            className="w-12 bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-[1.25rem] transition-all flex items-center justify-center border border-transparent hover:border-red-100"
            title="Delete Property"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;