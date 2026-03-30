import { 
  HiOutlineTrash, 
  HiOutlinePencilSquare, 
  HiOutlineScale, 
  HiOutlineCalendarDays,
  HiOutlineUserCircle
} from "react-icons/hi2";
import { useDispatch, useSelector } from 'react-redux';
import { deleteUnitAction } from '../app/slices/unitSlice';
import { RootState, AppDispatch } from '../app/store';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface UnitCardProps {
  unit: any;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Availability Logic
  const isVacant = unit.isAvailable === true || unit.status?.toLowerCase() === 'available' || unit.status?.toLowerCase() === 'vacant';

  const handleDelete = async () => {
    const unitName = unit.unitNumber || unit.name || "this unit";
    if (!window.confirm(`Are you sure you want to permanently delete ${unitName}?`)) return;

    const loadingToast = toast.loading("Updating records...");

    try {
      const result = await dispatch(deleteUnitAction(unit.id));
      if (deleteUnitAction.fulfilled.match(result)) {
        toast.success(`${unitName} removed successfully`, { id: loadingToast });
      } else {
        toast.error("Action denied: Unit has active dependencies", { id: loadingToast });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Network synchronization failed", { id: loadingToast });
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

  const handleManage = () => {
    const basePath = user?.role === 'admin' ? '/admin' : '/landlord';
    navigate(`${basePath}/units/edit/${unit.id}`);
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 p-7 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Visual Status Decor */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.04] transition-transform duration-700 group-hover:scale-150 ${isVacant ? 'bg-emerald-600' : 'bg-rose-600'}`} />

      <div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-gray-900 tracking-tight">
              {unit.unitNumber || unit.name}
            </h4>
            <div className="flex items-center text-blue-600 font-black text-lg">
              <span className="text-sm mr-0.5">Ksh</span>
              {Number(unit.rentAmount || unit.price || 0).toLocaleString()}
              <span className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">/ month</span>
            </div>
          </div>
          
          <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-[0.1em] border shadow-sm transition-all ${
            isVacant 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-rose-50 text-rose-600 border-rose-100"
          }`}>
            {isVacant ? "Available" : "Occupied"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 py-5 border-t border-gray-50 relative z-10">
          {/* Category Info */}
          <div className="flex items-center group/item">
            <div className="p-2.5 bg-gray-50 rounded-xl mr-3 group-hover/item:bg-blue-50 transition-colors">
              <HiOutlineScale className="text-gray-400 group-hover/item:text-blue-600 w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Unit Type</p>
              <p className="text-sm font-bold text-gray-700">{unit.type || "Standard Studio"}</p>
            </div>
          </div>

          {/* Role-Specific Info: Admin sees Landlord name */}
          {user?.role === 'admin' && (
             <div className="flex items-center group/item">
                <div className="p-2.5 bg-gray-50 rounded-xl mr-3 group-hover/item:bg-purple-50 transition-colors">
                    <HiOutlineUserCircle className="text-gray-400 group-hover/item:text-purple-600 w-4.5 h-4.5" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Landlord</p>
                    <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
                        {unit.property?.landlord?.fullName || "System Admin"}
                    </p>
                </div>
             </div>
          )}

          {/* Date Info */}
          <div className="flex items-center group/item">
            <div className="p-2.5 bg-gray-50 rounded-xl mr-3 group-hover/item:bg-amber-50 transition-colors">
              <HiOutlineCalendarDays className="text-gray-400 group-hover/item:text-amber-600 w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Registered</p>
              <p className="text-sm font-bold text-gray-700">{formatDate(unit.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-3 relative z-10">
        <button 
          onClick={handleManage}
          className="flex-1 bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-gray-100 hover:shadow-blue-200 active:scale-95 flex items-center justify-center border border-transparent"
        >
          <HiOutlinePencilSquare className="mr-2 w-4 h-4" />
          Edit Unit
        </button>
        
        <button 
          onClick={handleDelete}
          className="bg-white border border-gray-100 hover:border-rose-100 hover:bg-rose-50 text-gray-300 hover:text-rose-600 p-4 rounded-2xl transition-all active:scale-90 hover:shadow-md"
          title="Delete Unit"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UnitCard;