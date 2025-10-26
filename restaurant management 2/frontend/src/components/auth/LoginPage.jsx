import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Load remembered username if exists
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setFormData(prev => ({ ...prev, username: rememberedUsername }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login(formData.username, formData.password);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      // Store token expiry time
      if (data.expires_in) {
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
      
      toast.success(`Welcome back, ${data.user.full_name}!`, {
        icon: '👋',
        duration: 3000,
      });
      
      // Call parent onLogin callback
      if (onLogin) {
        onLogin(data.user);
      }
      
      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === 'chef') {
          navigate('/chef');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials', {
        icon: '❌',
        duration: 4000,
      });
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center' style={{ padding: 'var(--space-lg)' }}>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-success-500/10 rounded-full blur-3xl'></div>
      </div>

      <div className='relative z-10 w-full max-w-md'>
        {/* Logo and Header */}
        <div className='text-center' style={{ marginBottom: 'var(--space-xl)' }}>
          <div className='inline-flex items-center justify-center rounded-lg bg-gradient-primary shadow-primary-glow' style={{ width: '89px', height: '89px', marginBottom: 'var(--space-lg)' }}>
            <svg className='text-white' style={{ width: '55px', height: '55px' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
            </svg>
          </div>
          <h1 className='font-extrabold text-white' style={{ fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-xs)' }}>
            Restaurant Manager
          </h1>
          <p className='text-slate-400 font-medium' style={{ fontSize: 'var(--text-base)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Login Form Card */}
        <div className='glass-card border border-slate-700/50' style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Username Field */}
            <div>
              <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                Username
              </label>
              <input
                type='text'
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setErrors({ ...errors, username: '' });
                }}
                placeholder='Enter your username'
                className={`w-full bg-slate-800 text-white border focus:outline-none ${
                  errors.username ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-primary-500'
                }`}
                style={{
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  transition: 'all 0.382s'
                }}
              />
              {errors.username && (
                <p className='text-red-400 text-xs mt-1' style={{ fontSize: 'var(--text-xs)' }}>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className='block text-slate-300 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-xs)' }}>
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: '' });
                  }}
                  placeholder='Enter your password'
                  className={`w-full bg-slate-800 text-white border focus:outline-none ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-primary-500'
                  }`}
                  style={{
                    padding: 'var(--space-sm)',
                    paddingRight: '40px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    transition: 'all 0.382s'
                  }}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300'
                  style={{ transition: 'color 0.2s' }}
                >
                  {showPassword ? (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-400 text-xs mt-1' style={{ fontSize: 'var(--text-xs)' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className='flex items-center' style={{ gap: 'var(--space-xs)' }}>
              <input
                type='checkbox'
                id='rememberMe'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0'
              />
              <label htmlFor='rememberMe' className='text-slate-300 font-medium cursor-pointer' style={{ fontSize: 'var(--text-sm)' }}>
                Remember my username
              </label>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full gradient-primary text-white font-semibold hover:scale-[1.02] shadow-primary-glow disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                transition: 'all 0.382s'
              }}
            >
              {loading ? (
                <span className='flex items-center justify-center' style={{ gap: 'var(--space-sm)' }}>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className='border-t border-slate-700/50' style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)' }}>
            <p className='text-slate-400 font-semibold' style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)' }}>
              Demo Credentials:
            </p>
            <div className='grid grid-cols-2' style={{ gap: 'var(--space-sm)' }}>
              <button
                type='button'
                onClick={() => setFormData({ username: 'manager', password: 'manager123' })}
                className='bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700'
                style={{
                  padding: 'var(--space-xs)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  transition: 'all 0.382s'
                }}
              >
                👨‍💼 Manager
              </button>
              <button
                type='button'
                onClick={() => setFormData({ username: 'chef', password: 'chef123' })}
                className='bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700'
                style={{
                  padding: 'var(--space-xs)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  transition: 'all 0.382s'
                }}
              >
                👨‍🍳 Chef
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-slate-500' style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-lg)' }}>
          © 2025 Restaurant Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
