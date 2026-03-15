import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../app/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag } from "react-icons/fa";
import type { AppDispatch, RootState } from "../../app/store";

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student" as "student" | "landlord" | "admin",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(register(formData));

    if (register.fulfilled.match(resultAction)) {
      toast.success("Account created successfully!");
      // Corrected: Redirect based on the chosen role
      navigate(`/${formData.role}/dashboard`);
    } else {
      toast.error((resultAction.payload as string) || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 py-12">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-green-100/50 w-full max-w-lg border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Join Us</h2>
          <p className="text-gray-500 font-medium mt-1">Start your housing journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="fullName" type="text" onChange={handleChange} required placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:bg-white focus:border-green-200 transition-all font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="email" type="email" onChange={handleChange} required placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:bg-white focus:border-green-200 transition-all font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="phone" type="text" onChange={handleChange} placeholder="0712..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:bg-white focus:border-green-200 transition-all font-medium" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="password" type="password" onChange={handleChange} required placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-50 focus:bg-white focus:border-green-200 transition-all font-medium" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">I am a...</label>
            <div className="relative">
              <FaUserTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select name="role" value={formData.role} onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-green-50 focus:bg-white focus:border-green-200 transition-all font-bold text-gray-700">
                <option value="student">Student</option>
                <option value="landlord">Landlord</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;