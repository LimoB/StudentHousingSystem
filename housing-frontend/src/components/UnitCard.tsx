// src/components/UnitCard.tsx
import { HiOutlineTrash, HiOutlinePencilSquare, HiOutlineScale, HiOutlineCalendarDays } from "react-icons/hi2";
import { useDispatch } from 'react-redux';
import { deleteUnitAction } from '../app/slices/unitSlice';
import { AppDispatch } from '../app/store';
import toast from "react-hot-toast"; // Added toast

interface UnitCardProps {
  unit: any;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    if (!window.confirm(`Delete unit ${unit.unitNumber || unit.name}?`)) return;

    const loadingToast = toast.loading("Deleting unit...");

    try {
      const result = await dispatch(deleteUnitAction(unit.id));
      if (deleteUnitAction.fulfilled.match(result)) {
        toast.success("Unit removed", { id: loadingToast });
      } else {
        toast.error("Failed to remove unit", { id: loadingToast });
      }
    } catch (err) {
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-GB');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-xl font-black text-gray-900">Room {unit.unitNumber || unit.name}</h4>
            <p className="text-blue-600 font-bold">
              Ksh {Number(unit.price || 0).toLocaleString()}
              <span className="text-xs text-gray-400 font-normal"> /mo</span>
            </p>
          </div>
          <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
            unit.isAvailable || unit.status === 'available' 
              ? "bg-green-50 text-green-600 border border-green-100" 
              : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            {unit.isAvailable || unit.status === 'available' ? "Available" : "Occupied"}
          </span>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-center text-sm text-gray-500 font-medium">
            <HiOutlineScale className="mr-2 text-gray-400 w-4 h-4" />
            <span className="text-gray-400 mr-1">Size:</span> 
            <span className="text-gray-900">{unit.size || "Standard Room"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 font-medium">
            <HiOutlineCalendarDays className="mr-2 text-gray-400 w-4 h-4" />
            <span className="text-gray-400 mr-1">Listed:</span> 
            <span className="text-gray-900">{formatDate(unit.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-gray-50 flex space-x-2">
        <button className="flex-1 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center">
          <HiOutlinePencilSquare className="mr-2 w-4 h-4" /> Edit
        </button>
        <button 
          onClick={handleDelete}
          className="bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-4 rounded-xl transition-all flex items-center justify-center"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UnitCard;