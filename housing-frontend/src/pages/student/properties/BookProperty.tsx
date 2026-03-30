import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import { fetchUnitsByProperty } from "../../../app/slices/unitSlice";
import { createBookingAction } from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import {
  Calendar,
  User as UserIcon,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Info,
  Wallet,
} from "lucide-react";

const BookProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const unitIdFromQuery = searchParams.get("unitId");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedProperty, loading: propLoading } = useSelector(
    (state: RootState) => state.properties,
  );
  const { units, loading: unitsLoading } = useSelector(
    (state: RootState) => state.units,
  );
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Hardening the role detection to prevent 'undefined' in the URL string
  const userRole = (user as any)?.role || localStorage.getItem("userRole") || "student";
  
  const [moveInDate, setMoveInDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && token) {
      const propertyId = Number(id);
      dispatch(fetchPropertyById(propertyId));
      dispatch(fetchUnitsByProperty(propertyId));
    }
  }, [dispatch, id, token]);

  const unit = useMemo(() => {
    if (!unitIdFromQuery) return null;
    const foundInGlobal = units.find((u: any) => Number(u.id) === Number(unitIdFromQuery));
    if (foundInGlobal) return foundInGlobal;
    if (selectedProperty?.units) {
      return (selectedProperty.units as any[]).find((u: any) => Number(u.id) === Number(unitIdFromQuery));
    }
    return null;
  }, [units, selectedProperty, unitIdFromQuery]);

  if (propLoading || unitsLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">Preparing your lease documents...</p>
      </div>
    );

  if (!selectedProperty || !unit)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservation Expired</h2>
          <p className="text-slate-500 mb-8">We couldn't find the unit data. This happens if the session timed out.</p>
          <button 
            onClick={() => navigate(`/${userRole}/properties/${id}`)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all"
          >
            Return to Property
          </button>
        </div>
      </div>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveInDate) {
      toast.error("Please select a move-in date.");
      return;
    }

    setSubmitting(true);
    const loadId = toast.loading("Creating your reservation...");

    try {
      const studentId = (user as any)?.id || (user as any)?.userId;

      if (!studentId || !token) {
        throw new Error("Session invalid. Please log in again.");
      }

      const payload = {
        unitId: unit.id,
        studentId: studentId, 
        moveInDate: moveInDate,
        status: "pending",
      };

      // 1. Create the booking entry
      const result = await dispatch(createBookingAction(payload)).unwrap();

      toast.success("Reservation Created!", { id: loadId });

      /**
       * FIXING THE LOGOUT ISSUE:
       * 1. Ensure userRole is valid.
       * 2. Ensure result.id exists.
       * 3. Use a relative path if possible or verify absolute pathing.
       */
      if (result && result.id) {
        // Delay slightly so the Redux state for the new booking can settle
        setTimeout(() => {
          navigate(`/student/bookings/${result.id}/pay`, { replace: true });
        }, 800);
      }

    } catch (err: any) {
      toast.error(err?.message || "Failed to process booking.", { id: loadId });
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center text-slate-400 hover:text-blue-600 font-bold transition mb-10"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100 mb-4">
            <ShieldCheck size={12} /> Secure Booking Portal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Finalize your <span className="text-blue-600">Lease.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {selectedProperty.name} — <span className="text-slate-900 font-bold">Unit {unit.unitNumber}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <UserIcon size={20} className="text-blue-500" /> Applicant Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600">
                      {(user as any)?.fullName || (user as any)?.name || "Student Applicant"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Move-in Date</label>
                  <div className="relative group max-w-md">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-[#F8FAFC] border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <>Continue to Payment <ChevronRight size={20} /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-xl p-8 text-white relative">
                <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">Cost Breakdown</p>
                <div className="flex justify-between items-center pb-6 border-b border-slate-700/50 mb-6">
                  <span className="text-slate-400 text-sm">Monthly Rent</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">Ksh {Number(unit.price).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 size={12} /> Secure Lease
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Unit Number</span><span className="text-white font-bold">{unit.unitNumber}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Property</span><span className="text-white font-bold truncate max-w-[150px]">{selectedProperty.name}</span></div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                <div className="bg-white p-2 h-fit rounded-xl text-blue-600 shadow-sm"><Wallet size={20} /></div>
                <div>
                  <p className="text-[13px] text-blue-900 font-bold mb-1">Payment via M-Pesa</p>
                  <p className="text-[11px] text-blue-600 leading-relaxed font-semibold">Step 2: You will enter your M-Pesa PIN on the next screen.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookProperty;