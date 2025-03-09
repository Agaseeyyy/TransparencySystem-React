import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoPage = () => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center bg-gray-100">
      <h1 className="font-bold text-gray-800 text-9xl">404</h1>
      <div className="w-16 h-1 my-6 bg-jpcsred"></div>
      <h2 className="mb-4 text-3xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="max-w-md mb-8 text-lg text-gray-600">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          onClick={handleGoHome}
          className="px-6 py-3 font-medium text-white transition-colors rounded-lg bg-jpcsred hover:bg-jpcsred"
        >
          Go Home
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 font-medium text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default NoPage;