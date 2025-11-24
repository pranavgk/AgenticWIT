interface ErrorProps {
  message?: string;
  retry?: () => void;
}

export default function Error({ message = 'Something went wrong', retry }: ErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-error-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
