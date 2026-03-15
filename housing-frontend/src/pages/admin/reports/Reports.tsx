const Reports = () => {
  const reports = [
    "Monthly Revenue Report",
    "Active Lease Report",
    "Property Occupancy Report",
    "Maintenance Requests Report",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition"
          >
            <h2 className="font-semibold">{report}</h2>
            <p className="text-gray-500 text-sm">
              Generate and download report
            </p>

            <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">
              Generate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;