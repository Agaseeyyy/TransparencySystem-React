import { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthProvider';
import { accountService } from '../utils/apiService';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };
    
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await accountService.getCurrentProfile();
      console.log('Fetched profile data:', data);
      
      setCurrentUserData(data);
      setProfile({
        email: data.email || '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile information' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.email || !profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (profile.password && profile.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (profile.password && profile.password !== profile.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        email: profile.email
      };

      // Only include password if it's being changed
      if (profile.password && profile.password.trim()) {
        updateData.password = profile.password;
      }

      const updatedAccount = await accountService.updateCurrentProfile(updateData);
      console.log('Profile updated successfully:', updatedAccount);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setErrors({});
      
      // Update the current user data display
      setCurrentUserData(updatedAccount);
    } catch (error) {
      console.error('Failed to update profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 border-b-2 rounded-full border-rose-600 animate-spin"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen px-4 py-8 bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <motion.div 
              className="p-3 rounded-full bg-rose-100"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <UserCircle className="w-8 h-8 text-rose-600" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Update your account information and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            <p className="mt-1 text-sm text-gray-600">Update your basic account details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Info Display */}
            {(currentUserData || user) && (
              <motion.div 
                variants={itemVariants}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {currentUserData?.firstName || user?.firstName || 'N/A'} {currentUserData?.lastName || user?.lastName || ''}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-2 text-gray-900">{currentUserData?.role || user?.role || 'N/A'}</span>
                  </div>
                  {(currentUserData?.studentId || user?.studentId) && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Student ID:</span>
                        <span className="ml-2 text-gray-900">{currentUserData?.studentId || user?.studentId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Program:</span>
                        <span className="ml-2 text-gray-900">{currentUserData?.programCode || user?.programCode || 'N/A'}</span>
                      </div>
                      {(currentUserData?.yearLevel || user?.yearLevel) && (
                        <div>
                          <span className="font-medium text-gray-700">Year & Section:</span>
                          <span className="ml-2 text-gray-900">
                            {currentUserData?.yearLevel || user?.yearLevel} - {currentUserData?.section || user?.section}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Account ID:</span>
                    <span className="ml-2 text-gray-900">{currentUserData?.accountId || user?.accountId || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message Display */}
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center space-x-2 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <p className="mb-2 text-xs text-gray-500">Email address cannot be changed</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <motion.input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="block w-full py-3 pl-10 pr-3 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50"
                  placeholder="Enter your email address"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                New Password
              </label>
              <p className="mb-2 text-xs text-gray-500">Leave blank to keep current password</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  type={showPassword ? 'text' : 'password'}
                  value={profile.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            {profile.password && (
              <motion.div 
                variants={itemVariants}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={profile.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </motion.button>
                </div>
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div 
              variants={itemVariants}
              className="pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-white transition-colors rounded-lg bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-b-2 border-white rounded-full"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;
