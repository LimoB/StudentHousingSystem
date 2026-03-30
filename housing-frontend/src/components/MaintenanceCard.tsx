import type { MaintenanceRequest } from "../api/maintenance";
import { 
  HiOutlineUser, 
  HiOutlineCalendarDays, 
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineChatBubbleBottomCenterText
} from "react-icons/hi2";

interface Props {
  request: MaintenanceRequest;
  onDelete?: () => void;
  onUpdateStatus?: (status: string) => void;
  viewOnly?: boolean; // New prop for Admin/Oversight
}

const MaintenanceCard: React.FC<Props> = ({
  request,
  onDelete,
  onUpdateStatus,
  viewOnly = false
}) => {
  
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "resolved":
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50/50";
      case "in-progress":
      case "in_progress":
        return "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50/50";
      case "rejected":
        return "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50/50";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50/50";
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] border ${viewOnly ? 'border-purple-50' : 'border-gray-100'} p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden`}>
      
      {/* View-Only Accent for Admins */}
      {viewOnly && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
      )}

      <div>
        {/* Header: ID and Status */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex flex-col gap-2">
            <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${viewOnly ? 'bg-purple-600 shadow-purple-100' : 'bg-gray-900 shadow-gray-200'} text-white`}>
              Ticket #{request.id}
            </div>
            {viewOnly && (
               <div className="flex items-center gap-1 text-purple-400 font-black text-[9px] uppercase tracking-widest ml-1">
                 <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Read Only
               </div>
            )}
          </div>
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm transition-all ${getStatusStyles(request.status)}`}>
            {request.status.replace("_", " ")}
          </span>
        </div>

        {/* Unit & Property Title */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            Unit {request.unit.unitNumber}
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
            {request.unit.property.name}
          </p>
        </div>
        
        {/* Description Box */}
        <div className="my-6 p-6 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 min-h-[120px] relative group-hover:bg-white group-hover:border-blue-100 transition-all duration-500">
          <HiOutlineChatBubbleBottomCenterText className="absolute top-4 right-4 w-5 h-5 text-gray-200 group-hover:text-blue-200 transition-colors" />
          <p className="text-gray-600 text-sm font-bold leading-relaxed italic pr-4">
            "{request.description}"
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <HiOutlineUser className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Reporter</span>
              <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{request.student.fullName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <HiOutlineCalendarDays className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Log Date</span>
              <span className="text-xs font-bold text-gray-700">
                {new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className={`pt-6 border-t ${viewOnly ? 'border-purple-50' : 'border-gray-50'} flex flex-wrap gap-3`}>
        {!viewOnly && onUpdateStatus && request.status !== "resolved" && (
          <>
            {request.status !== "in-progress" && (
              <button
                onClick={() => onUpdateStatus("in-progress")}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-[1.25rem] hover:bg-amber-600 transition-all shadow-xl shadow-gray-100 hover:shadow-amber-100 active:scale-95"
              >
                <HiOutlineClock className="w-4 h-4 stroke-[2.5]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start Job</span>
              </button>
            )}

            <button
              onClick={() => onUpdateStatus("resolved")}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-[1.25rem] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
            >
              <HiOutlineCheckCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resolve</span>
            </button>
          </>
        )}

        {/* Admin/ViewOnly Message */}
        {viewOnly && (
          <div className="w-full flex items-center justify-center py-4 bg-gray-50 rounded-[1.25rem] border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Record Logged</p>
          </div>
        )}

        {/* Delete Action (Landlord/Student Only) */}
        {!viewOnly && onDelete && (
          <button
            onClick={onDelete}
            className="p-4 bg-white text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.25rem] transition-all border border-gray-100 hover:border-rose-100 active:scale-90"
            title="Archive Record"
          >
            <HiOutlineTrash className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceCard;