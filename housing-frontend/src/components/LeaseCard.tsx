import type { Lease } from "../api/leases";
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineHomeModern,
  HiOutlineTrash, // New icon
  HiOutlineNoSymbol // New icon
} from "react-icons/hi2";

interface Props {
  lease: Lease;
  onDelete?: (id: number) => void;
  onEnd?: (id: number) => void;
}

const LeaseCard: React.FC<Props> = ({ lease, onDelete, onEnd }) => {
  const isActive = lease.status === "active";

  return (
    // Replaced [2.5rem] with standard modern rounding and shadow
    <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Section: Property Info */}
        <div className="flex justify-between items-start mb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-900 p-3.5 rounded-2xl text-white shadow-lg shadow-gray-200">
              <HiOutlineHomeModern className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight capitalize">
                {lease.unit.property.name}
              </h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                Unit {lease.unit.unitNumber} • {lease.unit.property.location}
              </p>
            </div>
          </div>
          <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            isActive ? "bg-green-100 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
          }`}>
            {lease.status}
          </span>
        </div>

        {/* Tenant Info Section */}
        <div className="space-y-3 mb-7 bg-[#FBFDFF] p-4 rounded-2xl border border-blue-50/50">
          <div className="flex items-center gap-3">
            <HiOutlineUser className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold text-gray-700">{lease.student.fullName}</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <HiOutlineEnvelope className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-gray-500 truncate pr-6">{lease.student.email}</span>
            {/* Added tooltip for long emails */}
            <span className="absolute -top-7 left-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{lease.student.email}</span>
          </div>
          {lease.student.phone && (
            <div className="flex items-center gap-3">
              <HiOutlinePhone className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium text-gray-500">{lease.student.phone}</span>
            </div>
          )}
        </div>

        {/* Dates Section */}
        <div className="flex justify-between items-center mb-1 px-1">
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Start Date</p>
            <p className="text-xs font-semibold text-gray-700">{new Date(lease.startDate).toLocaleDateString()}</p>
          </div>
          <div className="h-px w-8 bg-gray-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">End Date</p>
            <p className={`text-xs font-semibold ${isActive ? "text-blue-500" : "text-gray-700"}`}>
              {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Ongoing"}
            </p>
          </div>
        </div>
      </div>

      {/* COMPACT & ALWAYS VISIBLE ACTIONS */}
      <div className="pt-6 border-t border-gray-100 mt-6 flex justify-end gap-3">
        {isActive && onEnd && (
          <button
            onClick={() => onEnd(lease.id)}
            className="flex items-center gap-2 p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors shadow-inner"
            title="Terminate Lease"
          >
            <HiOutlineNoSymbol className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Terminate</span>
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(lease.id)}
            className="flex items-center gap-2 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
            title="Delete Record"
          >
            <HiOutlineTrash className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaseCard;