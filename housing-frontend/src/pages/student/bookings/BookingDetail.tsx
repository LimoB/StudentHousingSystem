import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById } from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";
import { 
  ChevronLeft, 
  Loader2, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Info,
  CreditCard,
  Building2,
  ArrowRight
} from "lucide-react";

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedBooking, loading, error } = useSelector(
    (state: RootState) => state.bookings
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-slate-400 font-medium animate-pulse">Fetching reservation details...</p>
    </div>
  );

  if (error || !selectedBooking) return (
    <div className="p-20 text-center bg-[#F8FAFC] min-h-screen">
      <div className="max-w-sm mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Notice</h2>
        <p className="text-slate-500 font-medium mb-8">{error || "Booking record not found."}</p>
        <button 
          onClick={() => navigate(-1)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-12 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center text-slate-400 hover:text-blue-600 font-bold transition mb-10"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to List
        </button>

        {/* Page Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100 mb-4">
            <ShieldCheck size={12} /> Official Reservation
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Booking <span className="text-blue-600">Details.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            Reference ID: #BK-{selectedBooking.id.toString().padStart(4, '0')}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-2xl font-black text-slate-900">Property Information</h3>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedBooking.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-blue-500"><Building2 size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Building</p>
                      <p className="text-lg font-bold text-slate-800">{selectedBooking.unit?.property?.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-blue-500"><MapPin size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">
                        {selectedBooking.unit?.property?.location || "Location not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-blue-500"><Calendar size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Move-In Date</p>
                      <p className="text-lg font-bold text-slate-800">
                        {selectedBooking.moveInDate ? new Date(selectedBooking.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-blue-500"><User size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resident</p>
                      <p className="text-lg font-bold text-slate-800">{selectedBooking.student?.fullName || "Student"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button for Pending */}
              {selectedBooking.status === 'pending' && (
                <div className="mt-12 pt-8 border-t border-slate-50">
                   <button 
                    onClick={() => navigate(`/student/payment/${selectedBooking.id}`)}
                    className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[1.8rem] font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                  >
                    Proceed to Payment <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-10 bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-xl">
              <div className="p-8 text-white relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                
                <div className="relative z-10">
                  <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">Financial Summary</p>
                  
                  <div className="flex justify-between items-center pb-6 border-b border-slate-700/50 mb-6">
                    <span className="text-slate-400 text-sm font-medium">Monthly Rent</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        Ksh {Number(selectedBooking.unit?.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Unit Number</span>
                      <span className="text-white font-bold">{selectedBooking.unit?.unitNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Status</span>
                      <span className="text-emerald-400 font-bold uppercase tracking-tighter">{selectedBooking.status}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mt-8">
                    <div className="flex items-center gap-3 text-blue-300">
                      <CreditCard size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Secure Digital Lease</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;