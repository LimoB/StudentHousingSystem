 
import { 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineArrowLeft,
  HiOutlineChatBubbleLeftRight,
  HiOutlineHomeModern,
  HiOutlineCalendarDays,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineFingerPrint
} from "react-icons/hi2";
import { Lease } from "../api/leases";
import * as React from "react";

interface TenantProfileProps {
  student: Lease["student"];
  lease?: Lease; 
  onBack: () => void;
}

const TenantProfile: React.FC<TenantProfileProps> = ({ student, lease, onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-5 duration-500 pb-20 w-full max-w-[1400px] mx-auto px-4 sm:px-6">
      
      {/* NAVIGATION HEADER - Scaled down for better fit */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-all font-bold uppercase text-[10px] tracking-widest group bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm active:scale-95"
        >
          <HiOutlineArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Registry
        </button>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
          <HiOutlineShieldCheck className="text-emerald-600 w-4 h-4" />
          <span className="text-emerald-600 font-black uppercase text-[9px] tracking-wider">Verified Identity</span>
        </div>
      </div>

      {/* MAIN CONTENT GRID - Optimized breakpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 p-8 md:p-10 text-center shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-xl shadow-indigo-200 transform group-hover:scale-105 transition-transform duration-500">
                {student.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#00d991] border-4 border-white rounded-xl shadow-lg flex items-center justify-center text-white">
                <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2 italic">
              {student.fullName}
            </h2>
            
            <div className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 mb-8">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Active Resident</p>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
               <a 
                href={`mailto:${student.email}`}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
               >
                 <HiOutlineEnvelope className="text-lg" />
                 Message
               </a>
               <a 
                href={`tel:${student.phone}`}
                className="w-full py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
               >
                 <HiOutlinePhone className="text-lg text-indigo-600" />
                 Call
               </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DATA SECTIONS */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          {/* SECTION 1: CONTACT POINTS */}
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 p-6 md:p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-8 bg-[#00d991] rounded-full"></div>
              <h3 className="text-lg font-black text-gray-900 italic tracking-tight uppercase">Registry Metrics</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <InfoTile icon={<HiOutlineEnvelope />} label="Email" value={student.email} theme="emerald" />
              <InfoTile icon={<HiOutlinePhone />} label="Phone" value={student.phone || "Not Set"} theme="blue" />
              <InfoTile icon={<HiOutlineFingerPrint />} label="Registry ID" value={`USR-${student.id || "00X"}SYNC`} theme="purple" />
              <InfoTile icon={<HiOutlineChatBubbleLeftRight />} label="Channel" value="System Portal" theme="amber" />
            </div>
          </div>

          {/* SECTION 2: OCCUPANCY CONTEXT */}
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 p-6 md:p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
              <h3 className="text-lg font-black text-gray-900 italic tracking-tight uppercase">Occupancy Context</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
                <InfoTile 
                    icon={<HiOutlineHomeModern />} 
                    label="Assignment" 
                    value={lease?.unit?.property?.name || "Pending Selection"} 
                    subValue={lease?.unit?.unitNumber ? `Unit: ${lease.unit.unitNumber}` : "Room Unallocated"}
                    theme="indigo"
                />
                <InfoTile 
                    icon={<HiOutlineCalendarDays />} 
                    label="Onboarded" 
                    value={student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"} 
                    theme="rose"
                />
            </div>
            <HiOutlineHomeModern className="absolute -right-10 -bottom-10 w-48 h-48 text-gray-50 opacity-40 -rotate-12 pointer-events-none" />
          </div>

          {/* SECTION 3: SYSTEM PROTOCOL */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                    <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-white" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-black mb-2 italic uppercase tracking-tighter">Security Protocol</h3>
                    <p className="text-indigo-50 font-medium leading-snug max-w-xl text-sm md:text-base opacity-90">
                        Official notices and maintenance requests must be logged through the <span className="text-white font-black underline underline-offset-4 decoration-emerald-400">HousingSync Ledger</span>.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* THE SUB-COMPONENT: Optimized for Mobile Fit */
const InfoTile = ({ icon, label, value, subValue, theme = "blue" }: any) => {
    const themes: any = {
        emerald: "text-emerald-600 bg-emerald-50",
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
        amber: "text-amber-600 bg-amber-50",
        indigo: "text-indigo-600 bg-indigo-50",
        rose: "text-rose-600 bg-rose-50"
    };

    return (
        <div className="flex items-center gap-4 p-5 md:p-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group overflow-hidden">
            <div className={`p-4 rounded-xl shadow-sm transition-all group-hover:scale-105 ${themes[theme]}`}>
                {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 md:w-7 md:h-7" })}
            </div>
            <div className="text-left overflow-hidden">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm md:text-base font-black text-gray-800 leading-tight truncate">{value}</p>
                {subValue && (
                  <p className="text-[10px] font-bold text-indigo-500 mt-1 truncate italic">
                    {subValue}
                  </p>
                )}
            </div>
        </div>
    );
};

export default TenantProfile;