import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchUsers, 
  createUserAction, 
  updateUserAction, 
  deleteUserAction 
} from "../../../app/slices/userSlice";
import { RootState, AppDispatch } from "../../../app/store";
import { User } from "../../../app/slices/authSlice"; // Import the User type
import { 
  HiOutlineUserPlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineUserGroup,
  HiOutlineFingerPrint,
  HiOutlineNoSymbol
} from "react-icons/hi2";
import toast from "react-hot-toast";

interface UserFormData {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  role: "student" | "admin" | "landlord";
}

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "student"
  });

  const handleSync = useCallback(async () => {
    try {
      await dispatch(fetchUsers()).unwrap();
    } catch (err: any) {
      toast.error(err || "Sync failed");
    }
  }, [dispatch]);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: "", // Always empty initially for security
      phone: user.phone || "",
      role: user.role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ fullName: "", email: "", password: "", phone: "", role: "student" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading(editingUser ? "Updating Record..." : "Provisioning...");

    try {
      if (editingUser) {
        // Build update payload
        const updateData: any = { ...formData };
        if (!updateData.password || updateData.password.trim() === "") {
            delete updateData.password;
        }

        // Use userId consistently
        await dispatch(updateUserAction({ id: editingUser.userId, data: updateData })).unwrap();
        toast.success("Identity Updated", { id: tid });
      } else {
        await dispatch(createUserAction(formData as any)).unwrap();
        toast.success("User Onboarded", { id: tid });
      }
      resetForm();
    } catch (err: any) {
      toast.error(err || "Action failed", { id: tid });
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Purge this identity?")) return;
    const tid = toast.loading("Purging...");
    try {
      await dispatch(deleteUserAction(userId)).unwrap();
      toast.success("Record Deleted", { id: tid });
      if (editingUser?.userId === userId) resetForm();
    } catch (err: any) {
      toast.error(err || "Delete failed", { id: tid });
    }
  };

  const roleStyles: Record<string, string> = {
    admin: "bg-purple-50 text-purple-600 border-purple-100",
    landlord: "bg-blue-50 text-blue-600 border-blue-100",
    student: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gray-900 text-white shadow-lg">
              <HiOutlineUserGroup className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Identity Hub</h1>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">System Governance Registry</p>
        </div>
        <button onClick={handleSync} className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm">
          <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: REGISTRY TABLE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HiOutlineMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" placeholder="Search identities..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-white border border-gray-200 rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none shadow-sm"
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="landlord">Landlords</option>
              <option value="student">Students</option>
            </select>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-6 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((u) => (
                    <tr key={u.userId} className={`group transition-all ${editingUser?.userId === u.userId ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 shadow-sm ${roleStyles[u.role]}`}>
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-black text-gray-900 text-sm leading-none mb-1.5">{u.fullName}</span>
                            <span className="block text-[11px] font-bold text-gray-400 mb-2">{u.email}</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${roleStyles[u.role]}`}>
                              <HiOutlineFingerPrint className="w-2.5 h-2.5" /> {u.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="inline-flex items-center gap-1.5 text-emerald-500 font-black text-[8px] uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                           <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Active
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(u)} className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <HiOutlinePencilSquare className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(u.userId)} className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                            <HiOutlineTrash className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMMAND PANEL */}
        <div className="lg:col-span-4 sticky top-10">
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden">
            <div className={`p-8 border-b transition-colors ${editingUser ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-900 text-white border-gray-800'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    {editingUser ? "Modify Identity" : "Onboarding"}
                  </h2>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${editingUser ? 'text-blue-100' : 'text-gray-400'}`}>
                    {editingUser ? `Editing: ${editingUser.fullName}` : "Provision New Access"}
                  </p>
                </div>
                {editingUser && (
                  <button onClick={resetForm} className="p-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors">
                    <HiOutlineNoSymbol className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Full Name</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
                  value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email Address</label>
                <input required type="email" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Role</label>
                  <select className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  >
                    <option value="student">Student</option>
                    <option value="landlord">Landlord</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Phone</label>
                  <input type="text" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none shadow-inner"
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                  {editingUser ? "Password (Blank to keep)" : "System Password"}
                </label>
                <input type={editingUser ? "text" : "password"} placeholder={editingUser ? "••••••••" : "Min 8 chars"} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                />
              </div>

              <div className="pt-4 space-y-3">
                <button type="submit" className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${editingUser ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  {editingUser ? <><HiOutlinePencilSquare className="w-4 h-4"/> Update Identity</> : <><HiOutlineUserPlus className="w-4 h-4"/> Commit Account</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;