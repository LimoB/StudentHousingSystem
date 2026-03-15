import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPropertyById } from "../../../app/slices/propertySlice";
import { createBookingAction } from "../../../app/slices/bookingSlice";
import type { RootState, AppDispatch } from "../../../app/store";

const BookProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get("unitId"); // Specific unit from URL

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedProperty, loading, error } = useSelector((state: RootState) => state.properties);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && token) {
      dispatch(fetchPropertyById(Number(id)));
    }
  }, [dispatch, id, token]);

  if (!token) return <p className="p-6 text-red-500 text-center">Login required.</p>;
  if (loading) return <p className="p-6 text-center">Loading property details...</p>;
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (!selectedProperty || !unitId) return <p className="p-6 text-center">Invalid request. No unit selected.</p>;

  const property = selectedProperty as any;
  const unit = property.units?.find((u: any) => u.id === Number(unitId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !unit) return;

    setSubmitting(true);
    try {
      const payload = {
        unitId: unit.id,
        studentId: user.id,
        moveInDate: null, // Can add a date picker if needed
      };

      await dispatch(createBookingAction(payload)).unwrap();
      setSuccess("Booking request sent successfully!");
      setTimeout(() => navigate(`/student/properties`), 2000);
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Confirm Booking</h1>
        <p className="text-gray-500 mb-8">{property.name}</p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-center">
            {success}
          </div>
        )}

        <div className="bg-blue-50 p-6 rounded-2xl mb-8 space-y-2">
          <p className="text-sm text-blue-600 uppercase font-bold tracking-wider">Unit Details</p>
          <p className="text-xl font-bold text-gray-800">Unit Number: {unit?.unitNumber}</p>
          <p className="text-2xl font-extrabold text-blue-700">Ksh {Number(unit?.price).toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
            <p><strong>Full Name:</strong> {user?.fullName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting || !!success}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                submitting || success ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {submitting ? "Processing..." : "Confirm & Send Request"}
            </button>
            
            <Link
              to={`/student/properties/${id}`}
              className="text-center py-2 text-gray-500 font-medium hover:text-gray-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookProperty;