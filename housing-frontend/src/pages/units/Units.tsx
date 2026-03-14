import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnits } from "../../app/slices/unitSlice";
import { RootState, AppDispatch } from "../../app/store";
import UnitCard from "../../components/UnitCard";
import AddUnit from "./AddUnit";
import { Unit } from "../../api/units";

const Units: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { units, loading, error } = useSelector((state: RootState) => state.units);

  useEffect(() => {
    dispatch(fetchUnits());
  }, [dispatch]);

  // Optional: refresh units automatically after create/update/delete
  // You can also listen to slice state changes if needed.

  if (loading) return <p className="p-6">Loading units...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Units</h1>

      {/* Add Unit Form */}
      <div className="mb-6">
        <AddUnit />
      </div>

      {/* Error display */}
      {error && (
        <p className="text-red-500 mb-4">
          Error: {error}
        </p>
      )}

      {/* Units Grid */}
      {units.length === 0 ? (
        <p>No units found.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit: Unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Units;