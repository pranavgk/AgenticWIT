export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">AgenticWIT Dashboard</h1>
          <nav className="flex gap-4">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/projects" className="text-gray-600 hover:text-gray-900">
              Projects
            </a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
