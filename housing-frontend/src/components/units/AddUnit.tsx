import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { createUnitAction } from "../../app/slices/unitSlice";
import { fetchProperties } from "../../app/slices/propertySlice";
import { RootState, AppDispatch } from "../../app/store";
import { 
  HiOutlineArrowLeft, 
  HiOutlineHomeModern, 
  HiOutlineTag, 
  HiOutlineCurrencyDollar, 
  HiOutlineCube 
} from "react-icons/hi2";
import toast from "react-hot-toast";

const AddUnit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { properties } = useSelector((state: RootState) => state.properties);
  const preSelectedId = location.state?.propertyId || "";

  // Aligning state keys with your DB Schema (units table)
  const [formData, setFormData] = useState({
    unitNumber: "",
    propertyId: preSelectedId,
    price: "",
    size: "Bedsitter",
    isAvailable: true
  });

  useEffect(() => {
    if (properties.length === 0) {
      dispatch(fetchProperties());
    }
  }, [dispatch, properties.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyId) return toast.error("Please select a property");
    if (!formData.price) return toast.error("Please set the monthly price");

    const loadingToast = toast.loading("Adding unit to property...");

    try {
      // Data matches the 'CreateUnitPayload' and Drizzle Schema
      await dispatch(createUnitAction({
        unitNumber: formData.unitNumber,
        propertyId: Number(formData.propertyId),
        price: Number(formData.price), // Convert string input to number for API
        size: formData.size,
        isAvailable: formData.isAvailable
      })).unwrap();

      toast.success(`Unit ${formData.unitNumber} listed successfully!`, { id: loadingToast });
      navigate("/landlord/units");
    } catch (err: any) {
      toast.error(err || "Failed to create unit", { id: loadingToast });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto min-h-screen bg-[#F8FAFC]">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-400 hover:text-gray-900 font-black transition mb-8 uppercase text-[10px] tracking-[0.2em]"
      >
        <HiOutlineArrowLeft className="mr-2 w-4 h-4 stroke-[3]" /> Back to Inventory
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-50 overflow-hidden">
        <div className="h-2 bg-blue-600 w-full" />
        
        <div className="p-8 md:p-12">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">List New Unit</h1>
            <p className="text-gray-500 font-medium">Define the space and pricing for your new listing.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Selection */}
            <div>
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                <HiOutlineHomeModern className="mr-2 w-4 h-4 text-blue-500" /> Target Property
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-5 rounded-[1.25rem] font-bold text-gray-700 transition appearance-none cursor-pointer"
                required
              >
                <option value="">Select a Building...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* unitNumber */}
              <div>
                <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  <HiOutlineTag className="mr-2 w-4 h-4 text-blue-500" /> Unit Label / Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. A1, Room 10"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-600 p-5 rounded-[1.25rem] font-bold"
                  required
                />
              </div>

              {/* price */}
              <div>
                <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  <HiOutlineCurrencyDollar className="mr-2 w-4 h-4 text-blue-500" /> Price per Month (Ksh)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-600 p-5 rounded-[1.25rem] font-bold"
                  required
                />
              </div>
            </div>

            {/* size Selection */}
            <div>
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                <HiOutlineCube className="mr-2 w-4 h-4 text-blue-500" /> Unit Configuration (Size)
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-600 p-5 rounded-[1.25rem] font-bold text-gray-700 transition appearance-none cursor-pointer"
                required
              >
                <option value="Bedspace">Bedspace</option>
                <option value="Bedsitter">Bedsitter</option>
                <option value="Single Room">Single Room</option>
                <option value="Studio">Studio</option>
                <option value="One Bedroom">One Bedroom</option>
                <option value="Two Bedroom">Two Bedroom</option>
              </select>
            </div>

            {/* isAvailable Toggle */}
            <div className="flex items-center justify-between p-6 bg-blue-50/30 rounded-[1.5rem] border border-blue-100/50">
              <div>
                <p className="font-black text-gray-900 text-sm">Instant Vacancy</p>
                <p className="text-xs text-gray-500 font-medium italic">Make room searchable immediately</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-5 rounded-[1.5rem] bg-gray-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-blue-600 transition-all transform hover:-translate-y-1 active:scale-95"
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