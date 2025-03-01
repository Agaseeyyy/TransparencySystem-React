import React from 'react';
import { useNavigate } from 'react-router-dom';

function NoPage() {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-12 text-center">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <div className="w-16 h-1 bg-jpcsred my-6"></div>
      <h2 className="text-3xl font-semibold mb-4 text-gray-700">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-jpcsred text-white font-medium rounded-lg hover:bg-jpcsred transition-colors"
        >
          Go Home
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default NoPage;