/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  HiOutlineCheckCircle,
  HiOutlineBuildingOffice,
  HiOutlineShieldCheck
} from "react-icons/hi2";
import toast from "react-hot-toast";

const PropertyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedProperty, loading } = useSelector((state: RootState) => state.properties);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isAdmin = user?.role === 'admin';
  const isEditMode = Boolean(id);
  const basePath = isAdmin ? '/admin' : '/landlord';

  // 1. Memoize the property ID
  const propertyIdNum = useMemo(() => (id ? Number(id) : null), [id]);

  // 2. Local state for form inputs
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });

  // 3. Initial Load for Edit Mode
  useEffect(() => {
    if (isEditMode && propertyIdNum) {
      dispatch(fetchPropertyById(propertyIdNum));
    }
  }, [dispatch, propertyIdNum, isEditMode]);

  // 4. Sync Form with Selected Property
  useEffect(() => {
    if (isEditMode && selectedProperty && selectedProperty.id === propertyIdNum) {
      setFormData({
        name: selectedProperty.name || "",
        location: selectedProperty.location || "",
        description: selectedProperty.description || "",
      });
    }
  }, [selectedProperty, propertyIdNum, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) return; // Block Admin from submitting

    try {
      if (isEditMode && propertyIdNum) {
        await dispatch(updatePropertyAction({ id: propertyIdNum, data: formData })).unwrap();
        toast.success("Registry updated");
      } else {
        await dispatch(createPropertyAction(formData as any)).unwrap();
        toast.success("Asset registered");
      }
      navigate(`${basePath}/properties`);
    } catch (_err) {
      toast.error("Sync failed: Data rejected");
    }
  };

  const handleDelete = async () => {
    if (isAdmin) return; // Block Admin from deleting

    if (window.confirm("CRITICAL: This action removes all linked units and leases. Proceed?")) {
      try {
        if (propertyIdNum) {
          await dispatch(deletePropertyAction(propertyIdNum)).unwrap();
          toast.success("Asset purged from portfolio");
          navigate(`${basePath}/properties`);
        }
      } catch (_err) {
        toast.error("Purge failed: Active dependencies exist");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigation */}
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
          
          {/* Left: Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <HiOutlineBuildingOffice className="w-32 h-32" />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ${isAdmin ? 'bg-purple-600' : 'bg-gray-900'}`}>
                    <HiOutlineHome className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Property Profile</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                    {isAdmin 
                      ? "Viewing immutable registry data for this asset. Modifications are restricted to the primary landlord." 
                      : isEditMode 
                        ? "Update building core details. These changes sync instantly to the student portal." 
                        : "Define a new asset. Accurate mapping requires precise location data."}
                </p>
            </div>

            {/* Danger Zone: Only for Landlords */}
            {isEditMode && !isAdmin && (
                <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100">
                    <h4 className="text-rose-900 font-black text-[10px] uppercase tracking-widest mb-4">Danger Zone</h4>
                    <button 
                        type="button"
                        onClick={handleDelete}
                        className="w-full flex items-center justify-center gap-2 bg-white text-rose-500 border border-rose-200 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <HiOutlineTrash className="w-4 h-4" /> Purge Property
                    </button>
                </div>
            )}

            {isAdmin && (
              <div className="bg-purple-50 rounded-[2.5rem] p-8 border border-purple-100 flex items-start gap-4">
                 <HiOutlineShieldCheck className="text-purple-600 w-6 h-6 flex-shrink-0" />
                 <div>
                    <h4 className="text-purple-900 font-black text-[10px] uppercase tracking-widest mb-1">Audit Mode</h4>
                    <p className="text-purple-700/70 text-xs font-bold leading-tight">System-level lock active. Registry edits are disabled.</p>
                 </div>
              </div>
            )}
          </div>

          {/* Right: The Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-10">
                
                {/* Property Name */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        <HiOutlineHome className="text-blue-500 w-4 h-4" /> Official Building Name
                    </label>
                    <input
                        required
                        disabled={isAdmin}
                        type="text"
                        placeholder="e.g. Blue Ridge Executive Suites"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 transition-all disabled:opacity-60"
                    />
                </div>

                {/* Location */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        <HiOutlineMapPin className="text-orange-500 w-4 h-4" /> Geographic Address
                    </label>
                    <input
                        required
                        disabled={isAdmin}
                        type="text"
                        placeholder="e.g. Juja, Kalimoni Road"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 transition-all disabled:opacity-60"
                    />
                </div>

                {/* Description */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                        <HiOutlineDocumentText className="text-indigo-500 w-4 h-4" /> Portfolio Description
                    </label>
                    <textarea
                        required
                        disabled={isAdmin}
                        rows={5}
                        placeholder="Describe security features, distance to school, and amenities..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] p-5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 transition-all resize-none disabled:opacity-60"
                    />
                </div>

                {/* Submit/Info Bar */}
                <div className="pt-4">
                    {!isAdmin ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition shadow-2xl shadow-gray-200 hover:shadow-blue-200 active:scale-95 disabled:bg-gray-100 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <span className="animate-pulse tracking-[0.1em]">Synchronizing...</span>
                            ) : (
                                <>
                                    <HiOutlineCheckCircle className="w-5 h-5 stroke-[3]" />
                                    {isEditMode ? "Save Registry Changes" : "Confirm Asset Creation"}
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="bg-purple-900 text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 opacity-90">
                           <HiOutlineShieldCheck className="w-5 h-5" />
                           Registry Entry Protected
                        </div>
                    )}
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyEdit;