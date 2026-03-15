// src/components/PropertyCard.tsx
import { Link } from "react-router-dom";
import { Property } from "../api/properties";

interface Props {
  property: Property;
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  return (
    <div className="bg-white shadow rounded-lg p-5 hover:shadow-md transition duration-300">
      {/* Property Name */}
      <h2 className="text-xl font-semibold mb-2">{property.name}</h2>

      {/* Location */}
      <p className="text-gray-600 mb-2">📍 {property.location}</p>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-2">
        {property.description || "No description provided."}
      </p>

      {/* Status and View Details */}
      <div className="flex justify-between items-center">
        <Link
          to={`/properties/${property.id}`}
          className="text-blue-600 font-medium hover:underline"
          onClick={() => {
            console.log("Viewing property:", property);
          }}
        >
          View Details
        </Link>

        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            property.status === "available"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {property.status || "Unknown"}
        </span>
      </div>

      {/* Created Date */}
      <div className="mt-2 text-gray-400 text-sm">
        Created: {new Date(property.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PropertyCard;