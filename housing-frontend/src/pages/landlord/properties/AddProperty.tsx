// src/pages/landlord/properties/AddProperty.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPropertyAction } from "../../../app/slices/propertySlice";
import { AppDispatch } from "../../../app/store";
import { HiOutlineArrowLeft, HiOutlineHomeModern } from "react-icons/hi2";
import toast from "react-hot-toast"; // 1. Import toast

const AddProperty: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: "", location: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 2. Use a promise-based toast for a premium feel
    const loadingToast = toast.loading("Registering property...");

    try {
      const resultAction = await dispatch(createPropertyAction(formData));
      
      if (createPropertyAction.fulfilled.match(resultAction)) {
        toast.success(`${formData.name} added successfully!`, { id: loadingToast });
        navigate("/landlord/properties");
      } else {
        const errorMessage = resultAction.payload as string || "Failed to add property";
        toast.error(errorMessage, { id: loadingToast });
      }
    } catch (err) {
      toast.error("An unexpected error occurred", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-blue-600 font-black transition mb-8 uppercase text-xs tracking-widest"
      >
        <HiOutlineArrowLeft className="mr-2 w-4 h-4" /> Back to Properties
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        {/* Visual Brand Strip */}
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 w-full" />
        
        <div className="p-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <HiOutlineHomeModern className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">New Property</h1>
              <p className="text-gray-500 font-medium">List your hostel to start receiving student bookings.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Property Name
              </label>
              <input
                type="text"
                placeholder="e.g. Riverside Quarters"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Location Details
              </label>
              <input
                type="text"
                placeholder="e.g. Near Main Campus, Westlands"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Description & Amenities
              </label>
              <textarea
                rows={4}
                placeholder="Describe the rooms, security, water availability, etc..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] text-white font-black text-lg shadow-xl transition-all transform hover:-translate-y-1 ${
                loading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-blue-600 shadow-gray-200"
              }`}
            >
              {loading ? "Registering..." : "Create Property"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;