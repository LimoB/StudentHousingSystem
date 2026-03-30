/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { 
  createUnitAction, 
  updateUnitAction, 
  deleteUnitAction,
  fetchUnits 
} from "../../app/slices/unitSlice";
import { 
  HiOutlineArrowLeft, 
  HiOutlineCube, 
  HiOutlineCurrencyDollar, 
  HiOutlineHashtag, 
  HiOutlineArrowsPointingOut,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineShieldCheck
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
  const initialPropertyId = location.state?.propertyId || "";

  // 1. Find the unit directly from Redux
  const existingUnit = useMemo(() => {
    return isEditMode ? units.find((u) => u.id === Number(id)) : null;
  }, [id, isEditMode, units]);

  // 2. Local state for form inputs
  const [formData, setFormData] = useState({
    unitNumber: "",
    price: "",
    size: "",
    isAvailable: true,
    propertyId: initialPropertyId,
  });

  // 3. Sync form data when unit is loaded
  useEffect(() => {
    if (isEditMode && existingUnit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        unitNumber: existingUnit.unitNumber || "",
        price: (existingUnit.price || 0).toString(),
        size: existingUnit.size || "",
        isAvailable: existingUnit.isAvailable ?? true,
        propertyId: existingUnit.propertyId || "",
      });
    }
  }, [existingUnit, isEditMode]); 

  // 4. Load data if missing
  useEffect(() => {
    if (isEditMode && units.length === 0) {
      dispatch(fetchUnits());
    }
  }, [dispatch, isEditMode, units.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) return; // Guard for Admin

    const payload = {
      ...formData,
      price: Number(formData.price),
      propertyId: Number(formData.propertyId),
    };

    try {
      if (isEditMode) {
        await dispatch(updateUnitAction({ id: Number(id), data: payload })).unwrap();
        toast.success("Unit record updated");
      } else {
        await dispatch(createUnitAction(payload)).unwrap();
        toast.success("New unit registered");
      }
      navigate(-1);
    } catch (_err) {
      toast.error("Operation failed: Database rejected changes");
    }
  };

  const handleDelete = async () => {
    if (isAdmin) return; // Guard for Admin

    if (window.confirm("Permanently remove this unit from the registry?")) {
      try {
        await dispatch(deleteUnitAction(Number(id))).unwrap();
        toast.success("Unit removed");
        navigate(-1);
      } catch (_err) {
        toast.error("Deletion failed: Active dependencies found");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
          >
            <div className="p-2 bg-white rounded-xl border border-gray-100 group-hover:border-blue-200 shadow-sm transition-all">
              <HiOutlineArrowLeft className="w-4 h-4 stroke-[3]" />
            </div>
            <span>Back</span>
          </button>
          
          <div className="text-right">
             <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
               {isAdmin ? "Inspect Unit" : isEditMode ? "Edit Unit" : "Add Unit"}
             </h1>
             {isAdmin && (
               <div className="flex items-center justify-end gap-1 text-purple-600 font-black text-[9px] uppercase tracking-widest mt-1">
                 <HiOutlineShieldCheck className="w-3 h-3" /> Audit Mode
               </div>
             )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Toggle Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
            <div className={`absolute left-0 top-0 w-1.5 h-full ${formData.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 ml-1">Live Occupancy Status</p>
              <p className={`font-black text-xl uppercase ${formData.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formData.isAvailable ? "Vacant & Ready" : "Occupied"}
              </p>
            </div>
            
            {!isAdmin && isEditMode && (
              <button
                type="button"
                onClick={() => setFormData(p => ({...p, isAvailable: !p.isAvailable}))}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${
                  formData.isAvailable 
                    ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                }`}
              >
                {formData.isAvailable ? <HiOutlineXCircle className="w-4 h-4 stroke-[2.5]"/> : <HiOutlineCheckCircle className="w-4 h-4 stroke-[2.5]"/>}
                Set as {formData.isAvailable ? "Occupied" : "Vacant"}
              </button>
            )}
          </div>

          {/* Form Content Card */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm space-y-10 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              
              {/* Unit Number */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <HiOutlineHashtag className="text-blue-500 w-4 h-4" /> Unit ID / Name
                </label>
                <input
                  required
                  disabled={isAdmin}
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                  placeholder="e.g. A-102"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-0 transition-all placeholder:text-gray-300 disabled:opacity-60"
                />
              </div>

              {/* Price */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <HiOutlineCurrencyDollar className="text-emerald-500 w-4 h-4" /> Monthly Rent (Ksh)
                </label>
                <input
                  required
                  disabled={isAdmin}
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-0 transition-all disabled:opacity-60"
                />
              </div>

              {/* Size */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <HiOutlineArrowsPointingOut className="text-indigo-500 w-4 h-4" /> Dimensions / Type
                </label>
                <input
                  required
                  disabled={isAdmin}
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  placeholder="e.g. 2 Bedroom / 450sqft"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-0 transition-all disabled:opacity-60"
                />
              </div>

              {/* Property ID Reference */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <HiOutlineCube className="text-orange-500 w-4 h-4" /> Parent Asset ID
                </label>
                <input
                  required
                  disabled={!!initialPropertyId || isEditMode || isAdmin}
                  value={formData.propertyId}
                  onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                  className="w-full bg-gray-100 border-none rounded-[1.25rem] p-4.5 font-black text-gray-400 cursor-not-allowed opacity-60"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-10 flex flex-col md:flex-row gap-4">
              {!isAdmin ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-blue-600 transition shadow-xl shadow-gray-200 hover:shadow-blue-200 active:scale-95 disabled:bg-gray-200"
                  >
                    {loading ? "Processing..." : isEditMode ? "Update Unit Record" : "Confirm & Register Unit"}
                  </button>
                  
                  {isEditMode && (
                    <button 
                      type="button" 
                      onClick={handleDelete} 
                      className="px-8 bg-white border border-gray-100 text-gray-300 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-[1.5rem] transition flex items-center justify-center active:scale-90"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full p-5 bg-purple-50 rounded-[1.5rem] border border-purple-100 text-center">
                  <p className="text-purple-600 font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                    <HiOutlineShieldCheck className="w-4 h-4" /> Data integrity protected via Admin Access
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitManagement;