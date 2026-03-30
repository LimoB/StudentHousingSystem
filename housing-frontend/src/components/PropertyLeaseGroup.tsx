/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import type { Lease } from "../api/leases";
import { 
  HiOutlineChevronDown, 
  HiOutlineChevronUp, 
  HiOutlineHomeModern,
  HiOutlineNoSymbol,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineShieldCheck,
  HiOutlineLockClosed
} from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { endLeaseAction, deleteLeaseAction } from "../app/slices/leaseSlice";
import type { AppDispatch, RootState } from "../app/store";
import toast from "react-hot-toast";

interface Props {
  propertyName: string;
  leases: Lease[];
  onViewProfile: (student: Lease["student"]) => void;
}

const PropertyLeaseGroup: React.FC<Props> = ({ propertyName, leases, onViewProfile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  
  // Get user role for view-only logic
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const location = leases[0]?.unit.property.location;

  const handleEnd = async (id: number) => {
    if (isAdmin) return; // Guard
    if (!window.confirm("Terminate this lease? The unit will become vacant.")) return;
    
    const tid = toast.loading("Ending lease...");
    try {
      const res = await dispatch(endLeaseAction(id));
      if (endLeaseAction.fulfilled.match(res)) {
        toast.success("Lease ended successfully", { id: tid });
      } else {
        toast.error("Failed to terminate lease", { id: tid });
      }
    } catch (err) {
      toast.error("An unexpected error occurred", { id: tid });
    }
  };

  const handleDelete = async (id: number) => {
    if (isAdmin) return; // Guard
    if (!window.confirm("Permanent Action: Delete this record entirely?")) return;
    
    const tid = toast.loading("Deleting record...");
    try {
      const res = await dispatch(deleteLeaseAction(id));
      if (deleteLeaseAction.fulfilled.match(res)) {
        toast.success("Record deleted", { id: tid });
      } else {
        toast.error("Could not delete record", { id: tid });
      }
    } catch (err) {
      toast.error("Error deleting record", { id: tid });
    }
  };

  return (
    <div className={`bg-white rounded-[2.5rem] border ${isAdmin ? 'border-purple-100' : 'border-gray-100'} shadow-sm overflow-hidden transition-all duration-500`}>
      {/* Property Header Accordion */}
      <div 
        className={`p-7 flex items-center justify-between cursor-pointer transition-colors ${isAdmin ? 'hover:bg-purple-50/30' : 'hover:bg-gray-50/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-6">
          <div className={`p-4.5 rounded-[1.25rem] text-white shadow-xl ${isAdmin ? 'bg-purple-600 shadow-purple-100' : 'bg-gray-900 shadow-gray-200'}`}>
            <HiOutlineHomeModern className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">{propertyName}</h2>
              {isAdmin && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Registry View
                </span>
              )}
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
              {location} • <span className={isAdmin ? 'text-purple-500' : 'text-blue-500'}>{leases.length} Registered Agreements</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {isOpen ? <HiOutlineChevronUp className="w-5 h-5 text-gray-300" /> : <HiOutlineChevronDown className="w-5 h-5 text-gray-300" />}
        </div>
      </div>

      {/* Table Section */}
      {isOpen && (
        <div className="border-t border-gray-50 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#FBFDFF]">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Unit</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tenant Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contract Timeline</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-10 py-6 font-black text-blue-600">
                    <span className="bg-blue-50 px-4 py-2 rounded-xl text-xs tracking-widest border border-blue-100">
                      {lease.unit.unitNumber}
                    </span>
                  </td>

                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{lease.student.fullName}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(lease.student);
                          }}
                          className="p-2 text-blue-400 hover:text-white hover:bg-blue-600 rounded-xl transition-all shadow-sm hover:shadow-blue-200"
                          title="Open Tenant Dossier"
                        >
                          <HiOutlineEye className="w-4.5 h-4.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium lowercase">{lease.student.email}</span>
                    </div>
                  </td>

                  <td className="px-10 py-6">
                    <div className="text-[11px] font-bold text-gray-500 flex flex-col gap-1 uppercase tracking-tight">
                      <span className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                         Start: {new Date(lease.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-2 text-blue-400">
                         <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                         Expiry: {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Open Ended"}
                      </span>
                    </div>
                  </td>

                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${
                      lease.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {lease.status}
                    </span>
                  </td>

                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {!isAdmin ? (
                        <>
                          {lease.status === 'active' && (
                            <button 
                              onClick={() => handleEnd(lease.id)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all border border-amber-100 active:scale-95 shadow-sm"
                            >
                              <HiOutlineNoSymbol className="w-4 h-4 stroke-[2.5]" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Terminate</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(lease.id)}
                            className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 active:scale-95 shadow-sm"
                            title="Delete Record"
                          >
                            <HiOutlineTrash className="w-4.5 h-4.5 stroke-[2.5]" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-400 rounded-xl border border-gray-100">
                           <HiOutlineLockClosed className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase tracking-widest">Protected</span>
                        </div>
                      )}
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