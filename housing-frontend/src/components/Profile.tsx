/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { updateProfileAction } from "../app/slices/userSlice";
import { logout } from "../app/slices/authSlice";
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlinePhone, 
  HiOutlineLockClosed, 
  HiOutlineShieldCheck,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles
} from "react-icons/hi2";
import toast from "react-hot-toast";

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.users);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Updating your profile...");
    try {
      const payload: any = { ...formData };
      if (!payload.password || payload.password.trim() === "") delete payload.password;
      await dispatch(updateProfileAction(payload)).unwrap();
      toast.success("Profile saved successfully!", { id: tid });
      setFormData((prev) => ({ ...prev, password: "" })); 
    } catch (err: any) {
      toast.error(err || "Failed to update", { id: tid });
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      dispatch(logout());
    }
  };

  const roleThemes: Record<string, { gradient: string; text: string; bg: string; light: string }> = {
    admin: { gradient: "from-indigo-500 to-purple-600", text: "text-purple-600", bg: "bg-purple-600", light: "bg-purple-50" },
    landlord: { gradient: "from-blue-500 to-indigo-600", text: "text-blue-600", bg: "bg-blue-600", light: "bg-blue-50" },
    student: { gradient: "from-emerald-400 to-teal-600", text: "text-emerald-600", bg: "bg-emerald-600", light: "bg-emerald-50" },
  };

  if (!user) return null;
  const theme = roleThemes[user.role] || roleThemes.student;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* MODERN WELCOME HEADER */}
      <div className={`relative w-full min-h-[16rem] rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} shadow-xl overflow-hidden mb-12 flex items-center`}>
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center px-8 md:px-12 py-10 gap-8">
          <div className="text-center md:text-left text-white">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">HousingSync Profile</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              Welcome back, {user.fullName.split(" ")[0]}!
            </h1>
            <p className="text-white/70 font-medium max-w-md">
              Keep your identity and contact markers updated for a seamless experience.
            </p>
          </div>

          {/* IMPROVED AVATAR CARD - Integrated into the flexbox to prevent "out of place" look */}
          <div className="bg-white/10 backdrop-blur-xl p-4 pr-8 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-4 transition-transform hover:scale-105">
            <div className={`w-16 h-16 rounded-2xl ${theme.bg} flex items-center justify-center text-2xl font-black text-white shadow-inner`}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Authenticated As</p>
              <p className="text-lg font-bold text-white capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: ACCOUNT OVERVIEW */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
            <h3 className="text-sm font-black text-gray-900 mb-8 flex items-center gap-2 italic">
              <HiOutlineShieldCheck className={`w-5 h-5 ${theme.text}`} /> Registry Details
            </h3>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 group">
                <div className={`p-3 rounded-2xl ${theme.light} ${theme.text} group-hover:scale-110 transition-transform`}>
                  <HiOutlineCheckBadge className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity Status</p>
                  <p className="text-sm font-bold text-gray-700">Verified System {user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className={`p-3 rounded-2xl ${theme.light} ${theme.text} group-hover:scale-110 transition-transform`}>
                  <HiOutlineCalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Since</p>
                  <p className="text-sm font-bold text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-50">
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
              >
                <HiOutlineArrowRightOnRectangle className="w-5 h-5" /> Terminate Session
              </button>
            </div>
          </div>
        </div>

        {/* MAIN FORM: EDIT PROFILE */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Personal Settings</h2>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Modify your system identification markers</p>
              </div>
              <div className={`hidden sm:flex p-4 rounded-2xl ${theme.light} ${theme.text}`}>
                <HiOutlineUser className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Full Legal Name</label>
                  <input 
                    type="text" required
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-gray-900 focus:bg-white transition-all shadow-inner"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Contact Link (Phone)</label>
                  <div className="relative group">
                    <HiOutlinePhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-gray-900 focus:bg-white transition-all shadow-inner"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Unique Identifier (Email)</label>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    type="email" disabled
                    className="w-full pl-12 pr-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed italic"
                    value={formData.email}
                  />
                </div>
                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter ml-2 italic">Identifiers are locked for system integrity</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Security Access Key (Password)</label>
                <div className="relative group">
                  <HiOutlineLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="ENTER NEW KEY TO OVERWRITE"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-gray-900 focus:bg-white transition-all shadow-inner placeholder:text-[10px] placeholder:tracking-widest"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] text-white shadow-2xl transition-all active:scale-[0.98] ${loading ? 'bg-gray-400 cursor-wait' : 'bg-gray-900 hover:bg-black hover:-translate-y-1'}`}
                >
                  {loading ? "Synchronizing..." : "Commit Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;