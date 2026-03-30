import { useState } from "react";
import type { Lease } from "../api/leases";
import { 
  HiOutlineChevronDown, 
  HiOutlineChevronUp, 
  HiOutlineHomeModern,
  HiOutlineNoSymbol,
  HiOutlineTrash 
} from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { endLeaseAction, deleteLeaseAction } from "../app/slices/leaseSlice";
import type { AppDispatch } from "../app/store";
import toast from "react-hot-toast";

interface Props {
  propertyName: string;
  leases: Lease[];
}

const PropertyLeaseGroup: React.FC<Props> = ({ propertyName, leases }) => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const location = leases[0]?.unit.property.location;

  const handleEnd = async (id: number) => {
    if (!window.confirm("Terminate this lease? The unit will become vacant.")) return;
    const tid = toast.loading("Ending lease...");
    const res = await dispatch(endLeaseAction(id));
    if (endLeaseAction.fulfilled.match(res)) toast.success("Lease ended", { id: tid });
    else toast.error("Failed to update", { id: tid });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Permanent Action: Delete this record?")) return;
    const tid = toast.loading("Deleting...");
    const res = await dispatch(deleteLeaseAction(id));
    if (deleteLeaseAction.fulfilled.match(res)) toast.success("Deleted", { id: tid });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
      {/* Property Header */}
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-5">
          <div className="bg-gray-900 p-4 rounded-2xl text-white shadow-lg shadow-gray-200">
            <HiOutlineHomeModern className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">{propertyName}</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mt-1">
              {location} • {leases.length} Total Units
            </p>
          </div>
        </div>
        <div className="p-2 bg-gray-50 rounded-full">
          {isOpen ? <HiOutlineChevronUp className="w-5 h-5 text-gray-400" /> : <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Table Section */}
      {isOpen && (
        <div className="border-t border-gray-50 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#FBFDFF]">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tenant Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lease Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-8 py-5 font-black text-blue-600">
                    <span className="bg-blue-50 px-3 py-1 rounded-lg">#{lease.unit.unitNumber}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800">{lease.student.fullName}</span>
                      <span className="text-xs text-gray-400 font-medium">{lease.student.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-xs font-bold text-gray-600">
                      {new Date(lease.startDate).toLocaleDateString()} - 
                      <span className="ml-1 text-blue-400">
                        {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Ongoing"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      lease.status === 'active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {lease.status}
                    </span>
                  </td>
                  {/* Actions column - Now Always Visible */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {lease.status === 'active' && (
                        <button 
                          onClick={() => handleEnd(lease.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all border border-amber-100 shadow-sm"
                          title="Terminate Lease"
                        >
                          <HiOutlineNoSymbol className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Terminate</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(lease.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                        title="Delete Lease"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PropertyLeaseGroup;