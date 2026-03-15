// src/pages/landlord/units/AddUnit.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUnitAction } from "../../../app/slices/unitSlice";
import { RootState, AppDispatch } from "../../../app/store";
import { HiOutlineArrowLeft, HiOutlineHomeModern, HiOutlineTag, HiOutlineScale } from "react-icons/hi2";
import toast from "react-hot-toast"; // Import toast

const AddUnit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { properties } = useSelector((state: RootState) => state.properties);

  const [formData, setFormData] = useState({
    unitNumber: "",
    propertyId: "",
    price: "",
    size: "Single Room",
    isAvailable: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Better validation feedback
    if (!formData.propertyId) {
      return toast.error("Please assign this unit to a property");
    }

    const loadingToast = toast.loading("Adding unit to inventory...");

    try {
      const resultAction = await dispatch(createUnitAction({
        unitNumber: formData.unitNumber,
        propertyId: Number(formData.propertyId),
        price: Number(formData.price),
        size: formData.size,
        isAvailable: formData.isAvailable
      })).unwrap();

      // 2. Success feedback
      toast.success(`Room ${formData.unitNumber} listed successfully!`, { id: loadingToast });
      navigate("/landlord/units");
    } catch (err: any) {
      // 3. Error feedback
      toast.error(err || "Failed to create unit. Please try again.", { id: loadingToast });
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-400 hover:text-blue-600 font-black transition mb-8 uppercase text-xs tracking-widest"
      >
        <HiOutlineArrowLeft className="mr-2 w-4 h-4" /> Back to Units
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500 w-full" />
        
        <div className="p-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Create New Unit</h1>
          <p className="text-gray-500 mb-8 font-medium">Add a room or apartment to your property portfolio.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div>
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                <HiOutlineHomeModern className="mr-2 w-4 h-4 text-blue-500" /> Assign to Property
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold text-gray-700 transition"
                required
              >
                <option value="">Select a Hostel...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <HiOutlineTag className="mr-2 w-4 h-4 text-blue-500" /> Unit Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 101"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Ksh Monthly Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                <HiOutlineScale className="mr-2 w-4 h-4 text-blue-500" /> Unit Size / Category
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-4 rounded-2xl font-bold text-gray-700 transition"
                required
              >
                <option value="Single Room">Single Room</option>
                <option value="Bedsitter">Bedsitter</option>
                <option value="Studio Apartment">Studio Apartment</option>
                <option value="One Bedroom">One Bedroom</option>
                <option value="Two Bedroom">Two Bedroom</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-black text-gray-900 text-sm">Instant Availability</p>
                <p className="text-xs text-gray-500">Make this room bookable immediately</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-5 rounded-[1.5rem] bg-gray-900 text-white font-black text-lg shadow-xl shadow-gray-200 hover:bg-blue-600 transition-all transform hover:-translate-y-1"
            >
              List Property Unit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUnit;