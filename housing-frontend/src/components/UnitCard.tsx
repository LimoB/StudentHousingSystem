import { 
  HiOutlineTrash, 
  HiOutlinePencilSquare, 
  HiOutlineScale, 
  HiOutlineCalendarDays 
} from "react-icons/hi2";
import { useDispatch } from 'react-redux';
import { deleteUnitAction } from '../app/slices/unitSlice';
import { AppDispatch } from '../app/store';
import toast from "react-hot-toast";

interface UnitCardProps {
  unit: any;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Helper to determine availability based on various possible backend keys
  const isVacant = unit.isAvailable === true || unit.status?.toLowerCase() === 'available';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${unit.unitNumber || unit.name}?`)) return;

    const loadingToast = toast.loading("Removing unit from records...");

    try {
      const result = await dispatch(deleteUnitAction(unit.id));
      if (deleteUnitAction.fulfilled.match(result)) {
        toast.success("Unit deleted successfully", { id: loadingToast });
      } else {
        toast.error("Failed to delete unit", { id: loadingToast });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("A network error occurred", { id: loadingToast });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 p-7 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${isVacant ? 'bg-green-600' : 'bg-red-600'}`} />

      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-gray-900 tracking-tight">
              {unit.unitNumber || unit.name}
            </h4>
            <div className="flex items-center text-blue-600 font-black text-lg">
              <span className="text-sm mr-0.5">Ksh</span>
              {(unit.rentAmount || unit.price || 0).toLocaleString()}
              <span className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">/ month</span>
            </div>
          </div>
          
          <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border shadow-sm transition-colors ${
            isVacant 
              ? "bg-green-50 text-green-600 border-green-100" 
              : "bg-red-50 text-red-600 border-red-100"
          }`}>
            {isVacant ? "Vacant" : "Occupied"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 py-4 border-t border-gray-50">
          <div className="flex items-center group/item">
            <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover/item:bg-blue-50 transition-colors">
              <HiOutlineScale className="text-gray-400 group-hover/item:text-blue-500 w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Category</p>
              <p className="text-sm font-bold text-gray-700">{unit.type || unit.size || "Standard"}</p>
            </div>
          </div>

          <div className="flex items-center group/item">
            <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover/item:bg-orange-50 transition-colors">
              <HiOutlineCalendarDays className="text-gray-400 group-hover/item:text-orange-500 w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Date Added</p>
              <p className="text-sm font-bold text-gray-700">{formatDate(unit.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button 
          onClick={() => {/* Trigger Edit Modal or Navigate */}}
          className="flex-1 bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-gray-100 hover:shadow-blue-100 active:scale-95 flex items-center justify-center"
        >
          <HiOutlinePencilSquare className="mr-2 w-4 h-4" />
          Manage Unit
        </button>
        
        <button 
          onClick={handleDelete}
          className="bg-white border border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-300 hover:text-red-500 p-4 rounded-2xl transition-all active:scale-90"
          title="Delete Unit"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UnitCard;