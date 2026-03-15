import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../app/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";
import type { AppDispatch, RootState } from "../../app/store";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ email, password }));

    if (login.fulfilled.match(resultAction)) {
      toast.success(`Welcome back, ${resultAction.payload.user.fullName.split(" ")[0]}!`);
      const role = resultAction.payload.user.role;
      navigate(`/${role}/dashboard`);
    } else {
      toast.error((resultAction.payload as string) || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-blue-100/50 w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
            <FaBuilding className="text-2xl" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 font-medium mt-1">Log in to manage your housing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-[0.98] mt-4"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 font-medium text-sm">
          New to the system?{" "}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;