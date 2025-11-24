export default function ProjectsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
          Create Project
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            No projects yet. Create your first project to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
