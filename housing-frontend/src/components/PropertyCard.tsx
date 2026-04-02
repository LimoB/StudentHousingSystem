import { useMemo } from "react";
import { 
  HiOutlineMapPin, 
  HiOutlineTrash, 
  HiOutlinePencilSquare,
  HiOutlineBuildingOffice,
  HiOutlineEye,
  HiOutlinePhoto
} from "react-icons/hi2";
import { Property } from "../api/properties";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { deletePropertyAction } from '../app/slices/propertySlice';
import { AppDispatch, RootState } from '../app/store';
import toast from "react-hot-toast";

interface PropertyCardProps {
  property: Property & {
    landlord?: {
      fullName: string;
      email?: string;
    };
  };
  viewOnly?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewOnly = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Sync units from global state if they aren't pre-loaded in the property object
  const allUnits = useSelector((state: RootState) => state.units.units);

  const unitCount = useMemo(() => {
    if (property.units && property.units.length > 0) return property.units.length;
    if (property._count?.units !== undefined) return property._count.units;
    return allUnits.filter(u => u.propertyId === property.id).length;
  }, [allUnits, property]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewOnly) return; 
    
    if (!window.confirm(`Are you sure? This will permanently delete "${property.name}" and all associated units.`)) return;

    const loadingToast = toast.loading(`Decommissioning ${property.name}...`);

    try {
      const result = await dispatch(deletePropertyAction(property.id));
      if (deletePropertyAction.fulfilled.match(result)) {
        toast.success("Property removed from portfolio", { id: loadingToast });
      } else {
        const errorMessage = (result.payload as string) || "Deletion failed";
        toast.error(errorMessage, { id: loadingToast });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      toast.error("A network error occurred", { id: loadingToast });
    }
  };

  const handleNavigate = () => {
    const basePath = user?.role === 'admin' ? '/admin' : '/landlord';
    navigate(`${basePath}/properties/${property.id}`);
  };

  return (
    <div 
      onClick={handleNavigate}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden group cursor-pointer relative flex flex-col h-full"
    >
      {/* --- CLOUDINARY IMAGE HEADER --- */}
      <div className="h-52 relative overflow-hidden bg-gray-100">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-indigo-950 flex items-center justify-center">
            <HiOutlinePhoto className="text-white/20 w-12 h-12" />
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/20">
            {property.status || 'Verified Asset'}
          </div>
          
          {viewOnly && property.landlord && (
            <div className="bg-blue-600/90 backdrop-blur-md rounded-lg px-2.5 py-1 text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
              Provider: {property.landlord.fullName.split(' ')[0]}
            </div>
          )}
        </div>

        <HiOutlineBuildingOffice className="absolute -right-2 -bottom-2 w-24 h-24 text-white/10 rotate-12 transition-transform group-hover:scale-110 duration-700" />
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-6">
          <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1 uppercase tracking-tight">
            {property.name}
          </h3>
          <div className="flex items-center text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">
            <HiOutlineMapPin className="mr-1.5 text-blue-500 w-4 h-4" /> 
            {property.location}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6 mt-auto">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Inventory</p>
            <p className="text-2xl font-black tabular-nums text-gray-900">
              {unitCount.toString().padStart(2, '0')} <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Units</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Live Status</p>
            <div className="flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                {property.status === 'maintenance' ? 'Service' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            className={`flex-1 ${viewOnly ? 'bg-gray-100 text-gray-900 hover:bg-blue-600 hover:text-white' : 'bg-gray-900 text-white hover:bg-blue-600'} py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-lg shadow-gray-100 active:scale-95`}
          >
            {viewOnly ? (
              <><HiOutlineEye className="mr-2 w-4 h-4 stroke-[2.5]" /> Inspect</>
            ) : (
              <><HiOutlinePencilSquare className="mr-2 w-4 h-4 stroke-[2.5]" /> Manage</>
            )}
          </button>
          
          {!viewOnly && (
            <button 
              onClick={handleDelete}
              className="w-14 bg-white border border-gray-100 text-gray-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all flex items-center justify-center shadow-sm active:scale-90"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;