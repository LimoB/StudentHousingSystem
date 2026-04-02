// src/pages/landlord/properties/AddProperty.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPropertyAction } from "../../app/slices/propertySlice";
import { AppDispatch } from "../../app/store";
import { 
  HiOutlineArrowLeft, 
  HiOutlineHomeModern, 
  HiOutlineCamera, 
  HiOutlinePhoto,
  HiOutlineSparkles 
} from "react-icons/hi2";
import toast from "react-hot-toast";

const AddProperty: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // 1. Updated state: 'image' now holds the raw File object for Multer
  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    description: "",
    image: null as File | null 
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. Handle Image Selection (Binary / ObjectURL Style)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) return toast.error("Image too large (Max 5MB)");
      
      // Store the raw file for the API (FormData)
      setFormData(prev => ({ ...prev, image: file }));

      // Create a temporary URL for the UI preview (Instant & Low Memory)
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Registering property to ledger...");

    try {
      // Dispatching the action. The API service will convert this to FormData automatically.
      const resultAction = await dispatch(createPropertyAction(formData as any));
      
      if (createPropertyAction.fulfilled.match(resultAction)) {
        toast.success(`${formData.name} added to portfolio!`, { id: loadingToast });
        navigate("/landlord/properties");
      } else {
        const errorMessage = resultAction.payload as string || "Failed to add property";
        toast.error(errorMessage, { id: loadingToast });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("A network synchronization error occurred", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto min-h-screen bg-[#F8FAFC]">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-blue-600 font-black transition mb-10 uppercase text-[10px] tracking-[0.2em] group"
      >
        <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:border-blue-100 mr-3 shadow-sm transition-all">
            <HiOutlineArrowLeft className="w-4 h-4 stroke-[3]" />
        </div>
        Back to Portfolio
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full" />
        
        <div className="p-8 md:p-14">
          <div className="flex items-center space-x-6 mb-12">
            <div className="bg-gray-900 p-4 rounded-[1.5rem] text-white shadow-xl rotate-3">
              <HiOutlineHomeModern className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight uppercase">New Registry</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Expanding your digital footprint</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Image Upload Field */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Asset Visual Identity
              </label>
              <div className="relative group h-64 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 hover:bg-blue-50/30">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="text-center p-8">
                    <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <HiOutlinePhoto className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select a high-resolution cover photo</p>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <HiOutlineCamera className="text-white w-10 h-10 mb-2" />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Choose File</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Building Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand View Towers"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-5 rounded-[1.25rem] font-bold text-gray-900 transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Geographic Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Upper Hill, Nairobi"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-5 rounded-[1.25rem] font-bold text-gray-900 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                Asset Description
              </label>
              <textarea
                rows={4}
                placeholder="Details regarding amenities, security, and target audience..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-5 rounded-[1.5rem] font-bold text-gray-900 transition-all outline-none resize-none"
                required
              />
            </div>

            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className={`w-full py-6 rounded-[2rem] text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-blue-600 shadow-blue-100"
                }`}
                >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Encrypting Registry...
                    </>
                ) : (
                    <>
                        <HiOutlineSparkles className="w-5 h-5" />
                        Finalize Registry
                    </>
                )}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;