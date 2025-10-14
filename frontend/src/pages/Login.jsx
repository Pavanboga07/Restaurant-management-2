import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { ChefHat, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const quickLogin = async (role) => {
    setIsLoading(true);
    const credentials = {
      customer: { email: 'customer@demo.com', password: 'customer123' },
      manager: { email: 'manager@demo.com', password: 'manager123' },
      staff: { email: 'staff@demo.com', password: 'staff123' },
      chef: { email: 'chef@demo.com', password: 'chef123' },
    };

    const result = await login(credentials[role].email, credentials[role].password);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Logged in as ${role}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <ChefHat className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">RestaurantOS</h1>
          <p className="text-primary-100">Multi-Tenant Restaurant Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-secondary-800 mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder=""
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-secondary-500">Quick Demo Login</span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quickLogin('customer')}
              disabled={isLoading}
              className="px-4 py-2 border-2 border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 font-medium transition disabled:opacity-50"
            >
               Customer
            </button>
            <button
              onClick={() => quickLogin('manager')}
              disabled={isLoading}
              className="px-4 py-2 border-2 border-accent-200 text-accent-700 rounded-lg hover:bg-accent-50 font-medium transition disabled:opacity-50"
            >
               Manager
            </button>
            <button
              onClick={() => quickLogin('staff')}
              disabled={isLoading}
              className="px-4 py-2 border-2 border-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-50 font-medium transition disabled:opacity-50"
            >
               Staff
            </button>
            <button
              onClick={() => quickLogin('chef')}
              disabled={isLoading}
              className="px-4 py-2 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 font-medium transition disabled:opacity-50"
            >
               Chef
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 mt-6 text-sm">
           2024 RestaurantOS. Built with React + FastAPI
        </p>
      </div>
    </div>
  );
};

export default Login;
