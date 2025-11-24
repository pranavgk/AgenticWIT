'use client';

export default function Loading() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="text-center">
        <div 
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"
          aria-hidden="true"
        ></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        <span className="sr-only">Please wait while content is loading</span>
      </div>
    </div>
  );
}
