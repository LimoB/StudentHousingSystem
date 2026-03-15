import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import { fetchUnitsByProperty } from "../../../app/slices/unitSlice"; // Added unit fetch
import { createBookingAction } from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";

const BookProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get("unitId");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux State
  const { selectedProperty, loading: propLoading } = useSelector((state: RootState) => state.properties);
  const { units, loading: unitsLoading } = useSelector((state: RootState) => state.units);
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Local State
  const [moveInDate, setMoveInDate] = useState("");
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && token) {
      const propertyId = Number(id);
      dispatch(fetchPropertyById(propertyId));
      dispatch(fetchUnitsByProperty(propertyId));
    }
  }, [dispatch, id, token]);

  // Find the specific unit from the units slice
  const unit = units.find((u: any) => u.id === Number(unitId));

  if (!token) return <p className="p-6 text-red-500 text-center font-bold">Please log in to continue.</p>;
  if (propLoading || unitsLoading) return <p className="p-6 text-center animate-pulse">Fetching details...</p>;
  if (!selectedProperty || !unit) return <p className="p-6 text-center text-gray-500">Unit or Property not found.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!moveInDate) {
      setFormError("Please select a move-in date.");
      return;
    }

    if (!user || !unit) return;

    setSubmitting(true);
    try {
      const payload = {
        unitId: unit.id,
        studentId: user.id,
        moveInDate: moveInDate, // Now sending the actual date
        status: "pending"
      };

      await dispatch(createBookingAction(payload)).unwrap();
      setSuccess("Your booking request has been submitted successfully!");
      
      // Redirect after a short delay
      setTimeout(() => navigate(`/student/properties`), 2500);
    } catch (err: any) {
      setFormError(err || "Failed to process booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Finalize Booking</h1>
          <p className="text-blue-600 font-semibold">{selectedProperty.name}</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-2xl border border-green-200 font-bold text-center animate-bounce">
            {success}
          </div>
        )}
        {formError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium text-center">
            {formError}
          </div>
        )}

        {/* Unit Summary Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl mb-8 text-white shadow-lg">
          <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-4">
            <span className="text-blue-100 uppercase tracking-widest text-xs font-bold">Unit Selected</span>
            <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-black">
              {unit.unitNumber}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-blue-100 text-sm">Monthly Rent</p>
              <p className="text-3xl font-black">Ksh {Number(unit.price).toLocaleString()}</p>
            </div>
            <p className="text-xs text-blue-200">Inclusive of water/WiFi</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info (Read Only) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Full Name</label>
              <p className="text-sm font-bold text-gray-700 truncate">{user?.fullName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email</label>
              <p className="text-sm font-bold text-gray-700 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Expected Move-in Date
            </label>
            <input
              type="date"
              required
              value={moveInDate}
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all font-medium text-gray-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col gap-4">
            <button
              type="submit"
              disabled={submitting || !!success}
              className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all shadow-xl hover:shadow-blue-200 active:scale-95 ${
                submitting || success ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Booking..." : "Confirm Booking Request"}
            </button>
            
            <Link
              to={`/student/properties/${id}`}
              className="text-center py-2 text-gray-400 font-bold hover:text-gray-600 transition"
            >
              Go Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookProperty;