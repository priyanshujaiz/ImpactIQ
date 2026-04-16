const getAvailabilityColor = (status) => {
  return status === "available"
    ? "bg-green-100 text-green-600"
    : "bg-red-100 text-red-600";
};

const VolunteerCard = ({
  volunteer,
  zoneMap,
  onDelete,
  onAssign,
  onUpdateLocation,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-2">

      {/* Header */}
      <div className="flex justify-between">
        <h2 className="font-semibold">{volunteer.name}</h2>
        <span
          className={`text-xs px-2 py-1 rounded ${getAvailabilityColor(
            volunteer.availability
          )}`}
        >
          {volunteer.availability}
        </span>
      </div>

      {/* Skills */}
      <div className="flex gap-1 flex-wrap">
        {volunteer.skills?.map((s, i) => (
          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {s}
          </span>
        ))}
      </div>

      {/* Info */}
      <p className="text-sm text-gray-500">
        Reliability: {volunteer.reliabilityScore}
      </p>

      <p className="text-sm text-gray-500">
        Zone: {zoneMap[volunteer.currentZoneId] || "Unassigned"}
      </p>

      {/* ACTIONS */}
      <div className="flex gap-2 flex-wrap mt-2">
        <button
          className="text-xs bg-blue-100 px-2 py-1 rounded"
          onClick={() => onAssign(volunteer)}
        >
          Assign
        </button>

        <button
          className="text-xs bg-red-100 px-2 py-1 rounded"
          onClick={() => onDelete(volunteer.id)}
        >
          Delete
        </button>

        <button
          className="text-xs bg-yellow-100 px-2 py-1 rounded"
          onClick={() => onUpdateLocation(volunteer.id)}
        >
          Update Location
        </button>
      </div>
    </div>
  );
};

export default VolunteerCard;