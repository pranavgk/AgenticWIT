export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">AgenticWIT</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <a
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Dashboard
          </a>
          <a
            href="/projects"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Projects
          </a>
          <button className="text-gray-600 hover:text-gray-900 transition">
            Profile
          </button>
        </nav>
      </div>
    </header>
  );
}
