import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorContext } from '../../contexts/ErrorContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { authValidationRules } from '../../utils/validation';
import { Mail, Lock, Eye, EyeOff, Loader2, Wifi } from 'lucide-react';
import { healthService } from '../../services/healthService';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const { login, isLoading } = useAuth();
  const { handleError } = useErrorContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const {
    data: formData,
    errors,
    isSubmitting,
    setField,
    setError,
    handleSubmit: handleFormSubmit,
  } = useFormValidation({
    rules: authValidationRules.login,
    initialData: { email: '', password: '' },
    onSubmit: async (data) => {
      try {
        await login(data.email, data.password);
      } catch (error: any) {
        console.error('Login error:', error);
        const handlingResult = handleError(error, 'login');
        if (handlingResult.shouldLogout) {
          return;
        }
        setError('general', error.message || 'Login failed. Please try again.');
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const testApiConnection = async () => {
    setIsTestingConnection(true);
    try {
      // First test with fetch
      console.log('Testing with fetch...');
      const fetchResponse = await fetch('http://localhost:51423/api/health');
      console.log('Fetch response:', fetchResponse);
      
      if (fetchResponse.ok) {
        const fetchData = await fetchResponse.json();
        console.log('Fetch data:', fetchData);
        alert(`Fetch Test Successful! Status: ${fetchData.status}`);
      } else {
        alert(`Fetch Test Failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      // Then test with axios
      console.log('Testing with axios...');
      const result = await healthService.checkHealth();
      alert(`Axios Test Successful! Status: ${result.status}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`API Connection Failed: ${error}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back to SkillSwap
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account and continue learning
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 appearance-none relative block w-full px-3 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 appearance-none relative block w-full px-3 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="text-center text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {(isLoading || isSubmitting) ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Sign in'
              )}
            </button>
            
            <button
              type="button"
              onClick={testApiConnection}
              disabled={isTestingConnection}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isTestingConnection ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Wifi className="mr-2" size={16} />
                  Test API Connection
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;