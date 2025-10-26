/**
 * PREMIUM UI COMPONENTS LIBRARY
 * 
 * Reusable components with consistent styling
 * Glassmorphism effects, elegant animations
 */

import React from 'react';
import { PREMIUM_THEME } from '../../theme';

/* ==========================================
   GLASS CARD COMPONENT
   ========================================== */
export const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'base', // 'base', 'elevated', 'interactive'
  onClick,
  ...props 
}) => {
  const variantStyles = {
    base: 'glass-card',
    elevated: 'glass-premium shadow-premium',
    interactive: 'glass-card cursor-pointer hover:shadow-primary-glow'
  };

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/* ==========================================
   PREMIUM BUTTON COMPONENT
   ========================================== */
export const PremiumButton = ({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  size = 'base', // 'sm', 'base', 'lg'
  className = '',
  disabled = false,
  icon,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-4';
  
  const variantStyles = {
    primary: 'btn-gradient-primary text-white shadow-primary-glow hover:scale-105 active:scale-95 focus:ring-primary-500/30',
    secondary: 'btn-gradient-secondary text-white shadow-secondary-glow hover:scale-105 active:scale-95 focus:ring-secondary-500/30',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-danger-glow hover:scale-105 active:scale-95 focus:ring-danger-500/30',
    ghost: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500/30'
  };
  
  const sizeStyles = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  const sizePadding = {
    sm: { padding: 'var(--space-xs) var(--space-sm)', gap: 'var(--space-xs)', borderRadius: 'var(--radius-sm)' },
    base: { padding: 'var(--space-sm) var(--space-lg)', gap: 'var(--space-xs)', borderRadius: 'var(--radius-md)' },
    lg: { padding: 'var(--space-md) var(--space-xl)', gap: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' }
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      style={sizePadding[size]}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </button>
  );
};

/* ==========================================
   METRIC CARD COMPONENT
   ========================================== */
export const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendDirection = 'up', // 'up', 'down', 'neutral'
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger'
  className = ''
}) => {
  const iconColors = {
    primary: 'text-primary-400',
    secondary: 'text-secondary-400',
    success: 'text-success-500',
    danger: 'text-danger-500'
  };

  const trendColors = {
    up: 'text-success-400',
    down: 'text-danger-400',
    neutral: 'text-slate-400'
  };

  const bgGradients = {
    primary: 'from-primary-900/40 to-primary-800/20',
    secondary: 'from-secondary-900/40 to-secondary-800/20',
    success: 'from-success-900/40 to-success-800/20',
    danger: 'from-danger-900/40 to-danger-800/20'
  };

  return (
    <GlassCard variant="elevated" className={`relative overflow-hidden ${className}`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradients[variant]} opacity-50 pointer-events-none`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div 
          className="flex items-center justify-between"
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <p 
            className="text-slate-400 font-medium uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            {title}
          </p>
          {icon && (
            <div 
              className={`${iconColors[variant]} bg-slate-800/80 shadow-lg border border-slate-700/50`}
              style={{ 
                padding: 'var(--space-sm)', 
                borderRadius: 'var(--radius-lg)' 
              }}
            >
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h3 
              className={`font-extrabold ${variant === 'secondary' ? 'text-gradient-revenue' : `${iconColors[variant]}`}`}
              style={{ 
                fontSize: 'var(--text-3xl)', 
                lineHeight: 'var(--leading-tight)' 
              }}
            >
              {value}
            </h3>
          </div>
          
          {trend && (
            <div 
              className={`flex items-center font-semibold ${trendColors[trendDirection]}`}
              style={{ 
                gap: 'var(--space-xs)', 
                fontSize: 'var(--text-xs)' 
              }}
            >
              {trendDirection === 'up' && (
                <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {trendDirection === 'down' && (
                <svg style={{ width: '13px', height: '13px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

/* ==========================================
   PREMIUM BADGE COMPONENT
   ========================================== */
export const PremiumBadge = ({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger', 'warning'
  size = 'base', // 'sm', 'base'
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-700 border border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
    success: 'bg-success-100 text-success-700 border border-success-200',
    danger: 'bg-danger-100 text-danger-700 border border-danger-200',
    warning: 'bg-warning-100 text-warning-700 border border-warning-200'
  };

  const sizeStyles = {
    sm: { padding: 'var(--space-xs) var(--space-xs)', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-sm)' },
    base: { padding: 'var(--space-xs) var(--space-sm)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-sm)' }
  };

  return (
    <span 
      className={`inline-flex items-center font-semibold ${variantStyles[variant]} ${className}`}
      style={sizeStyles[size]}
    >
      {children}
    </span>
  );
};

/* ==========================================
   ICON WRAPPER COMPONENT
   ========================================== */
export const IconWrapper = ({ 
  children, 
  variant = 'default', // 'default', 'active', 'revenue', 'danger'
  size = 'base', // 'sm', 'base', 'lg', 'xl'
  className = ''
}) => {
  const colors = {
    default: 'text-text-secondary',
    active: 'text-primary-500',
    revenue: 'text-secondary-500',
    danger: 'text-danger-500'
  };

  const sizes = {
    sm: 'w-4 h-4',
    base: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <span className={`inline-flex ${colors[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

/* ==========================================
   PREMIUM INPUT COMPONENT
   ========================================== */
export const PremiumInput = ({ 
  label,
  error,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-3 ${icon ? 'pl-11' : ''} bg-white border-2 border-border-light rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-danger-600 font-medium">{error}</p>
      )}
    </div>
  );
};

/* ==========================================
   PREMIUM SELECT COMPONENT
   ========================================== */
export const PremiumSelect = ({ 
  label,
  error,
  options = [],
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 bg-white border-2 border-border-light rounded-lg text-text-primary focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
        {...props}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-danger-600 font-medium">{error}</p>
      )}
    </div>
  );
};

/* ==========================================
   LOADING SPINNER COMPONENT
   ========================================== */
export const LoadingSpinner = ({ size = 'base', variant = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    base: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colors = {
    primary: 'border-primary-500 border-t-transparent',
    secondary: 'border-secondary-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div className={`inline-block ${sizes[size]} ${colors[variant]} rounded-full animate-spin`}></div>
  );
};

/* ==========================================
   PREMIUM MODAL BACKDROP
   ========================================== */
export const ModalBackdrop = ({ children, onClose, className = '' }) => {
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn ${className}`}
      onClick={onClose}
    >
      <div 
        className="animate-scaleIn" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/* ==========================================
   PREMIUM DIVIDER
   ========================================== */
export const PremiumDivider = ({ text, className = '' }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex-grow border-t border-border-light"></div>
      {text && (
        <>
          <span className="flex-shrink mx-4 text-text-tertiary font-medium text-sm">{text}</span>
          <div className="flex-grow border-t border-border-light"></div>
        </>
      )}
    </div>
  );
};

export default {
  GlassCard,
  PremiumButton,
  MetricCard,
  PremiumBadge,
  IconWrapper,
  PremiumInput,
  PremiumSelect,
  LoadingSpinner,
  ModalBackdrop,
  PremiumDivider
};
