// src/components/PropertyCard.tsx
import { 
  HiOutlineMapPin, 
  HiOutlineTrash, 
  HiOutlinePencilSquare,
  HiOutlineBuildingOffice
} from "react-icons/hi2";
import { Property } from "../api/properties";
import { useDispatch, useSelector } from 'react-redux';
import { deletePropertyAction } from '../app/slices/propertySlice';
import { AppDispatch, RootState } from '../app/store';
import toast from "react-hot-toast"; // Added toast

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const dispatch = useDispatch<AppDispatch>();

  const unitsFromStore = useSelector((state: RootState) => 
    state.units.units.filter(u => u.propertyId === property.id)
  );

  const unitCount = property.units?.length || unitsFromStore.length || 0;

  const handleDelete = async () => {
    // Keeping a simple confirmation for safety, but using toast for the result
    if (!window.confirm(`Delete "${property.name}" and all its units?`)) return;

    const loadingToast = toast.loading(`Removing ${property.name}...`);

    try {
      const result = await dispatch(deletePropertyAction(property.id));
      if (deletePropertyAction.fulfilled.match(result)) {
        toast.success("Property deleted successfully", { id: loadingToast });
      } else {
        toast.error("Failed to delete property", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Something went wrong", { id: loadingToast });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 overflow-hidden group">
      <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 flex flex-col justify-between relative overflow-hidden">
        <HiOutlineBuildingOffice className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        <div className="flex justify-between items-start relative z-10">
          <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
            {property.status || 'Active'}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {property.name}
          </h3>
          <p className="flex items-center text-sm text-gray-400 mt-2 font-medium">
            <HiOutlineMapPin className="mr-1 text-blue-500" /> 
            {property.location}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-5">
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Units</p>
            <p className={`text-2xl font-black ${unitCount > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
              {unitCount.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Status</p>
            <p className="text-sm mt-1 inline-flex items-center text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live
            </p>
          </div>
        </div>

        <div className="mt-8 flex space-x-3">
          <button className="flex-1 bg-gray-900 text-white hover:bg-blue-600 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center shadow-lg shadow-gray-200">
            <HiOutlinePencilSquare className="mr-2 w-4 h-4" /> Manage
          </button>
          <button 
            onClick={handleDelete}
            className="w-12 bg-white border border-gray-100 hover:bg-red-50 text-gray-300 hover:text-red-500 py-3 rounded-2xl transition-all flex items-center justify-center"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;