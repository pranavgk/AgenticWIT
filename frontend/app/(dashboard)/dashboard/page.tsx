export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">My Work Items</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
          <p className="text-sm text-gray-500 mt-2">Active tasks assigned to you</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Active Projects</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
          <p className="text-sm text-gray-500 mt-2">Projects you're working on</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Pending Reviews</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
          <p className="text-sm text-gray-500 mt-2">Items awaiting your review</p>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity</p>
      </div>
    </div>
  );
}
