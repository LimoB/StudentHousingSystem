import { Link } from "react-router-dom";
import { Property } from "../api/properties";

interface Props {
  property: Property;
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  return (
    <div className="bg-white shadow rounded-lg p-5 hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">
        {property.name}
      </h2>

      <p className="text-gray-600 mb-2">
        📍 {property.location}
      </p>

      <p className="text-gray-700 mb-4 line-clamp-2">
        {property.description}
      </p>

      <div className="flex justify-between items-center">
        <Link
          to={`/properties/${property.id}`}
          className="text-blue-600 font-medium hover:underline"
        >
          View Details
        </Link>

        <span className="text-sm text-gray-400">
          {new Date(property.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default PropertyCard;