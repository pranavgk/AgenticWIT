'use client';

export default function Navigation() {
  return (
    <nav className="bg-primary-600 text-white" role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary-700">
        Skip to main content
      </a>
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a 
              href="/" 
              className="font-bold text-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded px-2 py-1"
            >
              AgenticWIT
            </a>
            <a 
              href="/dashboard" 
              className="hover:text-primary-100 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded px-2 py-1"
            >
              Dashboard
            </a>
            <a 
              href="/projects" 
              className="hover:text-primary-100 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded px-2 py-1"
            >
              Projects
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="hover:text-primary-100 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded px-2 py-1"
              aria-label="View notifications"
            >
              Notifications
            </button>
            <button 
              className="hover:text-primary-100 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded px-2 py-1"
              aria-label="View profile"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
