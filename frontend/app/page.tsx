export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to AgenticWIT
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Enterprise Work Item Tracking System
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/api"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View API Status
          </a>
          <a
            href="/docs"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Documentation
          </a>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          <p>🚀 Status: Development Environment</p>
          <p>🤖 Powered by AI Agent Orchestration</p>
        </div>
      </div>
    </main>
  )
}
