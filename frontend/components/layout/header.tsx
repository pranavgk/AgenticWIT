'use client';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4" role="banner">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">
            <a href="/" className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
              AgenticWIT
            </a>
          </h1>
        </div>
        <nav className="flex items-center space-x-6" aria-label="Primary navigation">
          <a
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
          >
            Dashboard
          </a>
          <a
            href="/projects"
            className="text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
          >
            Projects
          </a>
          <button 
            className="text-gray-600 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
            aria-label="View profile and settings"
          >
            Profile
          </button>
        </nav>
      </div>
    </header>
  );
}
