import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { 
  createUnitAction, 
  updateUnitAction, 
  deleteUnitAction,
} from "../../app/slices/unitSlice";
import { 
  HiOutlineArrowLeft, 
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineCloudArrowUp,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from "react-icons/hi2";
import toast from "react-hot-toast";

const UnitManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { units, loading } = useSelector((state: RootState) => state.units);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = user?.role === 'admin';
  const isEditMode = Boolean(id);
  
  // Use location state for new units, or existingUnit propertyId for edits
  const initialPropertyId = location.state?.propertyId || "";

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    unitNumber: "",
    price: "",
    size: "",
    isAvailable: true,
    propertyId: initialPropertyId,
  });

  // 1. Memoize the existing unit based on URL ID
  const existingUnit = useMemo(() => {
    return isEditMode ? units.find((u) => u.id === Number(id)) : null;
  }, [id, isEditMode, units]);

  // 2. Populate form when existingUnit is found (Fixes "Empty Form" issue)
  useEffect(() => {
    if (isEditMode && existingUnit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        unitNumber: existingUnit.unitNumber || "",
        price: (existingUnit.price || 0).toString(),
        size: existingUnit.size || "",
        isAvailable: existingUnit.isAvailable ?? true,
        propertyId: existingUnit.propertyId?.toString() || "",
      });
      if (existingUnit.imageUrl) setImagePreview(existingUnit.imageUrl);
    }
  }, [existingUnit, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cleanup old blob URL to save memory
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin || loading) return;

    if (!formData.propertyId) {
      return toast.error("Missing Property Reference");
    }

    const dataToSend = new FormData();
    dataToSend.append("unitNumber", formData.unitNumber);
    dataToSend.append("size", formData.size);
    dataToSend.append("isAvailable", String(formData.isAvailable));
    dataToSend.append("price", formData.price);
    dataToSend.append("propertyId", formData.propertyId);

    if (selectedFile) {
      dataToSend.append("image", selectedFile);
    }

    const loadToast = toast.loading(isEditMode ? "Updating unit..." : "Creating unit...");

    try {
      if (isEditMode) {
        await dispatch(updateUnitAction({ id: Number(id), data: dataToSend })).unwrap();
        toast.success("Unit updated successfully", { id: loadToast });
      } else {
        await dispatch(createUnitAction(dataToSend as any)).unwrap();
        toast.success("Unit created successfully", { id: loadToast });
      }
      
      setTimeout(() => navigate(-1), 500);
    } catch (err: any) {
      toast.error(err?.message || "Server Error", { id: loadToast });
    }
  };

  const handleDelete = async () => {
    if (isAdmin || loading) return;
    if (!window.confirm("Permanently remove this unit?")) return;

    const loadToast = toast.loading("Deleting unit...");
    try {
      await dispatch(deleteUnitAction(Number(id))).unwrap();
      toast.success("Unit deleted", { id: loadToast });
      navigate(-1);
    } catch (err: any) {
      toast.error(err?.message || "Deletion failed", { id: loadToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
          >
            <div className="p-3 bg-white rounded-2xl border border-gray-100 group-hover:border-blue-200 shadow-sm transition-all">
              <HiOutlineArrowLeft className="w-4 h-4 stroke-[3]" />
            </div>
            <span>Cancel & Return</span>
          </button>
          
          <div className="text-right">
             <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
               {isEditMode ? "Unit Management" : "New Unit"}
             </h1>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-1 ml-1">
               {isAdmin ? "Audit Mode" : "Inventory Control"}
             </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* IMAGE SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm group">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-all">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Unit" className="w-full h-full object-cover" />
                    {!isAdmin && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95">
                            Change Photo
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                         </label>
                      </div>
                    )}
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center p-8 text-center group">
                    <HiOutlineCloudArrowUp className="w-12 h-12 text-gray-200 mb-4 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Add Photos</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isAdmin} />
                  </label>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${
              formData.isAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <h4 className={`text-sm font-black uppercase tracking-widest ${formData.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formData.isAvailable ? "Available" : "Occupied"}
                </h4>
              </div>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, isAvailable: !p.isAvailable}))}
                  className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90"
                >
                  {formData.isAvailable ? <HiOutlineCheckCircle className="w-6 h-6 text-emerald-500" /> : <HiOutlineXCircle className="w-6 h-6 text-rose-500" />}
                </button>
              )}
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit Name / No.</label>
                  <input
                    required disabled={isAdmin}
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                    placeholder="e.g. A1"
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Rent (KES)</label>
                  <input
                    required disabled={isAdmin}
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                  <select
                    required disabled={isAdmin}
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Studio">Studio</option>
                    <option value="Bedsit">Bedsit</option>
                    <option value="Single Room">Single Room</option>
                    <option value="1 Bedroom">1 Bedroom</option>
                    <option value="2 Bedroom">2 Bedroom</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Ref</label>
                  <div className="w-full bg-gray-100 rounded-2xl p-5 font-black text-gray-500 text-xs tracking-widest">
                    ID: {formData.propertyId || "N/A"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-10 border-t border-gray-50">
                {!isAdmin ? (
                  <div className="flex flex-col md:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-3"
                    >
                      {loading ? "Processing..." : isEditMode ? "Save Changes" : "Create Unit"}
                    </button>
                    {isEditMode && (
                      <button 
                        type="button" 
                        onClick={handleDelete} 
                        className="px-8 py-6 bg-white text-rose-500 border border-rose-100 rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 flex items-center justify-center gap-3 text-purple-600 font-black text-[10px] uppercase tracking-widest">
                    <HiOutlineShieldCheck className="w-5 h-5" /> Read-Only Mode
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitManagement;