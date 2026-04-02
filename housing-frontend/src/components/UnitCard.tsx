// import React from 'react';
import { 
  HiOutlineTrash, 
  HiOutlinePencilSquare, 
  HiOutlineScale, 
  HiOutlineCalendarDays,
  HiOutlineUserCircle,
  HiOutlineEye,
  HiOutlinePhoto
} from "react-icons/hi2";
import { useDispatch, useSelector } from 'react-redux';
import { deleteUnitAction } from '../app/slices/unitSlice';
import { RootState, AppDispatch } from '../app/store';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface UnitCardProps {
  unit: {
    id: number;
    unitNumber?: string;
    name?: string;
    price?: number | string;
    rentAmount?: number | string;
    isAvailable?: boolean;
    status?: string;
    size?: string; 
    type?: string;
    imageUrl?: string;
    createdAt: string;
    property?: any; 
  };
  viewOnly?: boolean; 
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, viewOnly = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.role === 'admin';

  // Robust availability logic
  const isVacant = 
    unit.isAvailable === true || 
    unit.status?.toLowerCase() === 'available' || 
    unit.status?.toLowerCase() === 'vacant';

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewOnly || isAdmin) return;

    const unitName = unit.unitNumber || unit.name || `Unit #${unit.id}`;
    if (!window.confirm(`Permanently decommission ${unitName}? This action cannot be undone.`)) return;

    const loadingToast = toast.loading("Syncing with registry...");

    try {
      await dispatch(deleteUnitAction(unit.id)).unwrap();
      toast.success(`${unitName} removed from inventory`, { id: loadingToast });
    } catch (err: any) {
      const errorMsg = err?.message || "Action denied: Unit has active dependencies";
      toast.error(errorMsg, { id: loadingToast });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently Added";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recently Added" : date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAction = () => {
    const rolePath = isAdmin ? 'admin' : 'landlord';
    navigate(`/${rolePath}/units/edit/${unit.id}`);
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden flex flex-col h-full">
      
      {/* 1. IMAGE HEADER SECTION */}
      <div className="h-52 relative bg-gray-100 overflow-hidden">
        {unit.imageUrl ? (
          <img 
            src={unit.imageUrl} 
            alt={`Unit ${unit.unitNumber}`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <HiOutlinePhoto className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-[8px] font-black uppercase tracking-widest">No Visual Asset</span>
          </div>
        )}
        
        {/* Availability Badge Pinned to Image */}
        <div className="absolute top-5 left-5 z-20">
          <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 backdrop-blur-md shadow-sm transition-all ${
            isVacant 
              ? "bg-emerald-500/90 text-white border-emerald-400" 
              : "bg-rose-500/90 text-white border-rose-400"
          }`}>
             <div className={`w-1.5 h-1.5 rounded-full ${isVacant ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">
               {isVacant ? "Vacant" : "Occupied"}
             </span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-7 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              {unit.unitNumber || unit.name || "N/A"}
            </h4>
            <div className="flex items-center text-blue-600 font-black text-lg">
              <span className="text-xs mr-1 font-bold">KES</span>
              {Number(unit.price || unit.rentAmount || 0).toLocaleString()}
              <span className="text-[9px] text-gray-400 font-black uppercase ml-1.5 tracking-widest">/mo</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 py-6 border-t border-gray-50">
          
          {/* Classification */}
          <div className="flex items-center group/item">
            <div className="p-2.5 bg-gray-50 rounded-xl mr-3 group-hover/item:bg-blue-50 transition-colors">
              <HiOutlineScale className="text-gray-400 group-hover/item:text-blue-600 w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Classification</p>
              <p className="text-sm font-bold text-gray-700">{unit.size || unit.type || "Standard Unit"}</p>
            </div>
          </div>

          {/* Admin Context */}
          {isAdmin && (
             <div className="flex items-center group/item">
                <div className="p-2.5 bg-purple-50 rounded-xl mr-3">
                    <HiOutlineUserCircle className="text-purple-600 w-4 h-4" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Asset Landlord</p>
                    <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
                        {unit.property?.landlord?.fullName || "System Managed"}
                    </p>
                </div>
             </div>
          )}

          {/* Date Tracking */}
          <div className="flex items-center group/item">
            <div className="p-2.5 bg-gray-50 rounded-xl mr-3 group-hover/item:bg-amber-50 transition-colors">
              <HiOutlineCalendarDays className="text-gray-400 group-hover/item:text-amber-600 w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Registered On</p>
              <p className="text-sm font-bold text-gray-700">{formatDate(unit.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="mt-auto pt-6 flex items-center gap-3">
          <button 
            onClick={handleAction}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-transparent ${
              viewOnly || isAdmin
                ? 'bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600' 
                : 'bg-gray-900 text-white hover:bg-blue-600 shadow-gray-200'
            }`}
          >
            {viewOnly || isAdmin ? (
              <><HiOutlineEye className="w-4 h-4 stroke-[2.5]" /> Inspect</>
            ) : (
              <><HiOutlinePencilSquare className="w-4 h-4 stroke-[2.5]" /> Modify</>
            )}
          </button>
          
          {!viewOnly && !isAdmin && (
            <button 
              onClick={handleDelete}
              className="bg-white border border-gray-100 hover:border-rose-100 hover:bg-rose-50 text-gray-300 hover:text-rose-600 p-4 rounded-2xl transition-all active:scale-90 shadow-sm"
              title="Decommission Unit"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitCard;