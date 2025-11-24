export default function Navigation() {
  return (
    <nav className="bg-primary-600 text-white">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a href="/" className="font-bold text-lg">
              AgenticWIT
            </a>
            <a href="/dashboard" className="hover:text-primary-100 transition">
              Dashboard
            </a>
            <a href="/projects" className="hover:text-primary-100 transition">
              Projects
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-primary-100 transition">
              Notifications
            </button>
            <button className="hover:text-primary-100 transition">
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
