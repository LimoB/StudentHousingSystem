const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: "Booking Approved",
      message: "Your booking for Sunset Apartments has been approved.",
      date: "2026-03-10",
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Your rent payment of $500 has been received.",
      date: "2026-03-08",
    },
    {
      id: 3,
      title: "Maintenance Update",
      message: "Your maintenance request has been resolved.",
      date: "2026-03-05",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500"
          >
            <h2 className="font-semibold text-lg">{n.title}</h2>
            <p className="text-gray-600">{n.message}</p>
            <p className="text-sm text-gray-400 mt-2">{n.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;