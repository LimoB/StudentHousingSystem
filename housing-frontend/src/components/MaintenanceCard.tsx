import type { MaintenanceRequest } from "../api/maintenance";
import { 
  HiOutlineUser, 
  HiOutlineCalendarDays, 
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock
} from "react-icons/hi2";

interface Props {
  request: MaintenanceRequest;
  onDelete?: () => void;
  onUpdateStatus?: (status: string) => void;
}

const MaintenanceCard: React.FC<Props> = ({
  request,
  onDelete,
  onUpdateStatus,
}) => {
  // Map backend status to UI colors
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "resolved":
      case "completed":
        return "bg-green-50 text-green-600 border-green-100";
      case "in-progress":
      case "in_progress":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group">
      <div>
        {/* Header: ID and Status */}
        <div className="flex justify-between items-start mb-6">
          <div className="bg-gray-900 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200">
            Request #{request.id}
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(request.status)}`}>
            {request.status.replace("_", " ")}
          </span>
        </div>

        {/* Unit & Property Title */}
        <h2 className="text-xl font-black text-gray-900 mb-1 leading-tight">
          Unit {request.unit.unitNumber} • {request.unit.property.name}
        </h2>
        
        {/* Description Box */}
        <div className="my-6 p-5 bg-gray-50 rounded-2xl border border-gray-100 min-h-[100px]">
          <p className="text-gray-600 text-sm font-medium leading-relaxed italic">
            "{request.description}"
          </p>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <HiOutlineUser className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-gray-700">{request.student.fullName}</span>
          </div>
          <div className="flex items-center gap-3">
            <HiOutlineCalendarDays className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Opened: {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-2">
        {onUpdateStatus && request.status !== "resolved" && (
          <>
            {request.status !== "in-progress" && (
              <button
                onClick={() => onUpdateStatus("in-progress")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all border border-amber-50"
              >
                <HiOutlineClock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Start</span>
              </button>
            )}

            <button
              onClick={() => onUpdateStatus("resolved")}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all border border-green-50"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Resolve</span>
            </button>
          </>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-50"
            title="Delete Request"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceCard;