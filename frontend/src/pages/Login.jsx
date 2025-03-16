import React, { useEffect, useState } from 'react';
import bg from '../assets/bg.png'
import jpcs from '../assets/jpcs.png';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [credential, setCredential] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    isAuthenticated && navigate('/dashboard');
  }, []);


  const handleInput = (e) => {
    setCredential((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    login(credential.email, credential.password)
    .then(success => {
      if (success) {
        setMessage({ type: 'success', content: 'Login successful!' });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage({ type: 'error', content: 'Invalid email or password' });
      }
    })
    .catch(error => {
      setMessage({ type: 'error', content: 'An error occurred during login' });
      console.error('Error:', error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }


  return (
    <>
      <section
        className="relative h-screen bg-center bg-cover"
        style={{ backgroundImage: `url(${bg})`, }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Centered content */}
        <div className="relative flex flex-col items-center justify-center h-full px-6 py-8 mx-auto">
          {/* Logo and title */}
          <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-white">
            <img
              src={jpcs}
              className="h-6 rounded-full me-3 sm:h-7"
              alt="Org Logo"
            />
            JPCS Chapter
          </a>

          {/* Login card */}
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <div className="p-8">
              <h1 className="mb-6 text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Sign in to your account
              </h1>
              {message.content && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${
                  message.type === 'success' 
                    ? 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400' 
                    : 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400'
                }`} role="alert">
                  {message.content}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6" action="/login" method="post">
                {/* Email input */}
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={handleInput}
                    value={credential.email}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                {/* Password input */}
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    onChange={handleInput}
                    value={credential.password}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred"
                    required
                  />
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded accent-jpcsred bg-gray-50 focus:ring-jpcsred dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-jpcsred"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>
                  </div>
                  <a href="#" className="text-sm font-medium text-jpcsred hover:underline dark:text-jpcsred">
                    Forgot password?
                  </a>
                </div>

                {/* Sign in button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white bg-jpcsred hover:bg-jpcsred/90 focus:ring-4 focus:outline-none focus:ring-jpcsred font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-jpcsred dark:hover:bg-jpcsred/90 dark:focus:ring-jpcsred"
                >
                   {isLoading ? "Signing in..." : "Sign in"}
                </button>

              </form>
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
};

export default LoginPage;