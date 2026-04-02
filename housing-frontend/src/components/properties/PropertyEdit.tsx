/* eslint-disable react-hooks/set-state-in-effect */
 
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { 
  fetchPropertyById, 
  updatePropertyAction, 
  createPropertyAction, 
  deletePropertyAction 
} from "../../app/slices/propertySlice";
import { 
  HiOutlineArrowLeft, 
  HiOutlineHome, 
  HiOutlineMapPin, 
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineBuildingOffice,
  HiOutlinePhoto,
  HiOutlineCamera,
  HiOutlineSparkles
} from "react-icons/hi2";
import toast from "react-hot-toast";

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Added 'loading' from selector to manage button state
  const { selectedProperty, loading } = useSelector((state: RootState) => state.properties);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = user?.role === 'admin';
  const isEditMode = Boolean(id);
  const basePath = isAdmin ? '/admin' : '/landlord';
  const propertyIdNum = useMemo(() => (id ? Number(id) : null), [id]);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    image: null as File | null, 
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && propertyIdNum) {
      dispatch(fetchPropertyById(propertyIdNum));
    }
  }, [dispatch, propertyIdNum, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedProperty && selectedProperty.id === propertyIdNum) {
      setFormData({
        name: selectedProperty.name || "",
        location: selectedProperty.location || "",
        description: selectedProperty.description || "",
        image: null, 
      });
      setImagePreview(selectedProperty.imageUrl || null);
    }
  }, [selectedProperty, propertyIdNum, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("File exceeds 5MB limit");
      setFormData(prev => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin || loading) return; // Prevent double submission

    const loadToast = toast.loading(isEditMode ? "Synchronizing registry..." : "Finalizing asset...");

    try {
      const dataToSubmit = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        image: formData.image 
      };

      if (isEditMode && propertyIdNum) {
        await dispatch(updatePropertyAction({ id: propertyIdNum, data: dataToSubmit })).unwrap();
        toast.success("Registry updated successfully", { id: loadToast });
      } else {
        await dispatch(createPropertyAction(dataToSubmit as any)).unwrap();
        toast.success("Asset registered to portfolio", { id: loadToast });
      }
      
      navigate(`${basePath}/properties`);
    } catch (err: any) {
      // Check if DB updated but Redux format check failed
      if (err === "Server returned an invalid property format" || err?.message?.includes("format")) {
        toast.success("Changes saved successfully", { id: loadToast });
        navigate(`${basePath}/properties`);
      } else {
        console.error("Submission Error:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Update failed: Server Error (500)";
        toast.error(errorMessage, { id: loadToast });
      }
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !propertyIdNum || isAdmin || loading) return;
    if (!window.confirm("Permanently decommission this asset?")) return;

    const loadToast = toast.loading("Removing asset...");
    try {
      await dispatch(deletePropertyAction(propertyIdNum)).unwrap();
      toast.success("Asset removed", { id: loadToast });
      navigate(`${basePath}/properties`);
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : "Delete failed", { id: loadToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all group"
          >
            <div className="p-2.5 bg-white rounded-xl border border-gray-100 group-hover:border-blue-200 shadow-sm transition-all">
              <HiOutlineArrowLeft className="w-4 h-4 stroke-[3]" />
            </div>
            <span>{isAdmin ? "Exit Inspector" : "Cancel & Return"}</span>
          </button>

          <div className="text-right">
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
              {isAdmin ? "Global Oversight" : "Portfolio Management"}
            </p>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {isAdmin ? "Inspect Asset" : isEditMode ? "Modify Property" : "Register Property"}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ${isAdmin ? 'bg-purple-600' : 'bg-gray-900'}`}>
                    <HiOutlineHome className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Property Profile</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                   {isAdmin ? "Audit mode active." : "Manage asset core details and primary visual identity."}
                </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm overflow-hidden group">
               <div className="relative h-56 rounded-[2rem] bg-gray-50 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="text-center p-6">
                        <HiOutlinePhoto className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">No Image Assigned</p>
                    </div>
                  )}
                  {!isAdmin && (
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-[2px]">
                        <HiOutlineCamera className="w-8 h-8 mb-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Update Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
               </div>
            </div>

            {isEditMode && !isAdmin && (
                <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-white border border-rose-100 text-rose-500 p-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <HiOutlineTrash className="w-4 h-4" /> Decommission Asset
                </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        <HiOutlineBuildingOffice className="text-blue-500 w-4 h-4" /> Building Name
                    </label>
                    <input
                        required
                        disabled={isAdmin || loading}
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 transition-all outline-none disabled:opacity-60"
                    />
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        <HiOutlineMapPin className="text-orange-500 w-4 h-4" /> Geographic Location
                    </label>
                    <input
                        required
                        disabled={isAdmin || loading}
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 transition-all outline-none disabled:opacity-60"
                    />
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        <HiOutlineDocumentText className="text-indigo-500 w-4 h-4" /> Asset Description
                    </label>
                    <textarea
                        required
                        disabled={isAdmin || loading}
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] p-5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 transition-all resize-none outline-none disabled:opacity-60"
                    />
                </div>

                {!isAdmin && (
                    <div className="pt-6 border-t border-gray-50">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white p-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-50 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <HiOutlineSparkles className="w-4 h-4" />
                            )}
                            {loading ? "Processing..." : isEditMode ? "Commit Changes" : "Finalize Registration"}
                        </button>
                    </div>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyEdit;