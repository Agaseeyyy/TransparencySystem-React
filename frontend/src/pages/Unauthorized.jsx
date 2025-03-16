import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} 
             className="w-16 h-16 mx-auto mb-4 text-rose-600" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" 
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this resource.
        </p>
        
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 mr-2 text-white transition-colors rounded bg-rose-600 hover:bg-rose-700"
        >
          Go Back
        </button>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded hover:bg-gray-300"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;