import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import {
  fetchUnitsByProperty,
  resetUnits,
} from "../../../app/slices/unitSlice";
import { createBookingAction } from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import {
  Calendar,
  User,
  Mail,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Info,
  Wallet,
} from "lucide-react";

const BookProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get("unitId");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedProperty, loading: propLoading } = useSelector(
    (state: RootState) => state.properties,
  );
  const { units, loading: unitsLoading } = useSelector(
    (state: RootState) => state.units,
  );
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [moveInDate, setMoveInDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && token) {
      const propertyId = Number(id);
      // Reset units first to ensure we don't see data from previous property visits
      dispatch(resetUnits());
      dispatch(fetchPropertyById(propertyId));
      dispatch(fetchUnitsByProperty(propertyId));
    }
  }, [dispatch, id, token]);

  const unit = units.find((u: any) => u.id === Number(unitId));

  if (propLoading || unitsLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-400 font-medium animate-pulse">
          Generating your reservation...
        </p>
      </div>
    );

  if (!selectedProperty || !unit)
    return (
      <div className="p-20 text-center text-slate-500 font-bold">
        Reservation data not found. Please return to the property page.
      </div>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveInDate) {
      toast.error("Please select a move-in date.");
      return;
    }

    setSubmitting(true);
    const loadId = toast.loading("Processing your reservation...");

    try {
      const payload = {
        unitId: unit.id,
        studentId: user?.userId || (user as any)?.id,
        moveInDate: moveInDate,
        status: "pending",
      };

      await dispatch(createBookingAction(payload)).unwrap();

      // Success Feedback
      toast.success("Booking Request Sent! Redirecting to your dashboard...", {
        id: loadId,
        duration: 4000,
      });

      setTimeout(() => navigate(`/student/bookings`), 2000);
    } catch (err: any) {
      toast.error(err || "Failed to process booking.", { id: loadId });
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center text-slate-400 hover:text-blue-600 font-bold transition mb-10"
        >
          <ChevronLeft
            size={20}
            className="mr-1 group-hover:-translate-x-1 transition-transform"
          />
          Back to Selection
        </button>

        {/* Page Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100 mb-4">
            <ShieldCheck size={12} /> Secure Booking Portal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Finalize your <span className="text-blue-600">Lease.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            {selectedProperty.name} — Unit {unit.unitNumber}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* LEFT COLUMN: The Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <User size={20} className="text-blue-500" /> Applicant
                Information
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600">
                      {user?.fullName || "Student Applicant"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Select Move-in Date
                  </label>
                  <div className="relative group max-w-md">
                    <Calendar
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                      size={20}
                    />
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-[#F8FAFC] border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-1">
                    <Info size={12} /> Standard leases usually begin on the 1st
                    of the month.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Confirm Reservation <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: The Sidebar (Digital Receipt) */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-8 text-white relative">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

                  <div className="relative z-10">
                    <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">
                      Reservation Summary
                    </p>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-6 border-b border-slate-700/50">
                        <span className="text-slate-400 text-sm font-medium">
                          Monthly Rent
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white">
                            Ksh {Number(unit.price).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-end gap-1 mt-1">
                            <CheckCircle2 size={12} /> All Inclusive
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Unit Number</span>
                          <span className="text-white font-bold">
                            {unit.unitNumber}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Property</span>
                          <span className="text-white font-bold truncate max-w-[150px]">
                            {selectedProperty.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Utilities</span>
                          <span className="text-slate-300 font-medium">
                            Free WiFi/Water
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mt-6">
                        <div className="flex items-center gap-3 text-blue-300">
                          <CreditCard size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Digital Lease
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updated Payment/Approval Message */}
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
                <div className="bg-white p-2 h-fit rounded-xl text-blue-600 shadow-sm">
                  <Wallet size={20} />
                </div>
                <p className="text-xs text-blue-600 leading-relaxed font-semibold">
                  Instant Booking: Once payment is successful, this room is
                  automatically removed from the listings and your digital lease
                  is generated immediately.{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookProperty;
