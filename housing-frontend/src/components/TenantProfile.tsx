// import React from "react";
import { 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineIdentification, 
  HiOutlineArrowLeft,
  HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";
import { Lease } from "../api/leases";
import * as React from "react";

interface TenantProfileProps {
  student: Lease["student"];
  onBack: () => void;
}

const TenantProfile: React.FC<TenantProfileProps> = ({ student, onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Top Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-black uppercase text-[10px] tracking-widest mb-8 group"
      >
        <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Leases
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] border border-gray-100 p-10 text-center shadow-sm">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100">
                {student.fullName.charAt(0)}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full" title="Status: Active Tenant"></div>
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{student.fullName}</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Verified Resident</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-3">
               <a 
                href={`mailto:${student.email}`}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
               >
                 <HiOutlineEnvelope className="w-4 h-4" />
                 Send Email
               </a>
               <a 
                href={`tel:${student.phone}`}
                className="w-full py-4 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
               >
                 <HiOutlinePhone className="w-4 h-4" />
                 Call Tenant
               </a>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoTile 
                icon={<HiOutlineEnvelope />} 
                label="Primary Email" 
                value={student.email} 
              />
              <InfoTile 
                icon={<HiOutlinePhone />} 
                label="Phone Number" 
                value={student.phone || "Not Registered"} 
              />
              <InfoTile 
                icon={<HiOutlineIdentification />} 
                label="Account ID" 
                value={`TEN-00${student.fullName.length}82`} 
              />
              <InfoTile 
                icon={<HiOutlineChatBubbleLeftRight />} 
                label="Preferred Method" 
                value="Email / SMS" 
              />
            </div>
          </div>

          {/* Quick Notice Section */}
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <HiOutlineChatBubbleLeftRight className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 italic">Landlord Note</h3>
              <p className="text-blue-100 font-medium leading-relaxed max-w-md">
                Always ensure to log formal communications regarding maintenance or rent through the System Portal for legal compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Helper Sub-component for Tiles */
const InfoTile = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-colors group">
    <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </div>
    <div className="text-left">
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-gray-700 mt-0.5">{value}</p>
    </div>
  </div>
);

export default TenantProfile;