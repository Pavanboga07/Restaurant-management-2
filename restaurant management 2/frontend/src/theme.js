/**
 * RESTAURANT MANAGER - PREMIUM THEME SYSTEM
 * 
 * Rich, Elegant, Sophisticated Design System
 * Glassmorphism-influenced, Modern Minimalist Aesthetic
 * 
 * @version 2.0.0
 * @author Restaurant Manager Design Team
 */

export const PREMIUM_THEME = {
  // ==========================================
  // COLOR PALETTE
  // ==========================================
  colors: {
    // Background Colors
    background: {
      primary: '#F9F9F9',        // Ultra-light gray - main background
      secondary: '#F4F7F9',      // Light gray - alternative background
      card: '#FFFFFF',           // Pure white - card backgrounds
      overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
    },

    // Primary Accent - Deep Teal/Jade
    primary: {
      50: '#E6F7F5',             // Lightest tint
      100: '#B3E8E0',            // Light tint
      200: '#80D9CB',            // Medium-light
      300: '#4DCAB6',            // Medium
      400: '#26BBA2',            // Medium-dark
      500: '#14A38B',            // Base color - Deep Teal/Jade
      600: '#118C76',            // Dark
      700: '#0E7561',            // Darker
      800: '#0B5E4C',            // Very dark
      900: '#084737',            // Darkest
    },

    // Secondary Accent - Warm Gold/Copper
    secondary: {
      50: '#FFF9E6',             // Lightest tint
      100: '#FFEDB3',            // Light tint
      200: '#FFE180',            // Medium-light
      300: '#FFD54D',            // Medium
      400: '#FFC926',            // Medium-dark
      500: '#D4A574',            // Base color - Warm Gold/Copper
      600: '#C4915F',            // Dark
      700: '#B47D4A',            // Darker
      800: '#9E6A3D',            // Very dark
      900: '#875730',            // Darkest
    },

    // Danger/Alert - Muted Cranberry Red
    danger: {
      50: '#FAEBEB',
      100: '#F0C7C7',
      200: '#E6A3A3',
      300: '#DC7F7F',
      400: '#D25B5B',
      500: '#A94442',            // Base color - Muted Cranberry
      600: '#943A38',
      700: '#7F302E',
      800: '#6A2624',
      900: '#551C1A',
    },

    // Success - Refined Green
    success: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',            // Base color
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },

    // Warning - Elegant Amber
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFA726',            // Base color
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },

    // Text Colors
    text: {
      primary: '#333333',        // Deep charcoal - body text
      secondary: '#666666',      // Medium gray - secondary text
      tertiary: '#999999',       // Light gray - tertiary text
      inverse: '#FFFFFF',        // White - text on dark backgrounds
      disabled: '#CCCCCC',       // Disabled text
    },

    // Border Colors
    border: {
      light: '#E8E8E8',          // Light borders
      medium: '#D0D0D0',         // Medium borders
      dark: '#B0B0B0',           // Dark borders
    },

    // Shadow Colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.04)',
      medium: 'rgba(0, 0, 0, 0.08)',
      heavy: 'rgba(0, 0, 0, 0.12)',
      colored: 'rgba(20, 163, 139, 0.15)', // Primary color shadow
    },
  },

  // ==========================================
  // TYPOGRAPHY
  // ==========================================
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      secondary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      monospace: "'JetBrains Mono', 'Fira Code', monospace",
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },

    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em',
    },
  },

  // ==========================================
  // SPACING SCALE
  // ==========================================
  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },

  // ==========================================
  // BORDER RADIUS
  // ==========================================
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '8px',       // Standard for all buttons and cards
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // ==========================================
  // SHADOWS (Subtle, Diffused)
  // ==========================================
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    md: '0 6px 12px -2px rgba(0, 0, 0, 0.10), 0 3px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 20px -3px rgba(0, 0, 0, 0.12), 0 4px 8px -3px rgba(0, 0, 0, 0.06)',
    xl: '0 20px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 12px -5px rgba(0, 0, 0, 0.08)',
    
    // Glassmorphism shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    glassInset: 'inset 0 1px 3px 0 rgba(255, 255, 255, 0.5)',
    
    // Colored shadows
    primaryGlow: '0 8px 24px -4px rgba(20, 163, 139, 0.25)',
    secondaryGlow: '0 8px 24px -4px rgba(212, 165, 116, 0.25)',
    dangerGlow: '0 8px 24px -4px rgba(169, 68, 66, 0.25)',
  },

  // ==========================================
  // GLASSMORPHISM EFFECTS
  // ==========================================
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },

  // ==========================================
  // COMPONENT STYLES
  // ==========================================
  components: {
    // Button Styles
    button: {
      primary: {
        background: 'linear-gradient(135deg, #14A38B 0%, #0E7561 100%)',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px 24px',
        fontWeight: 600,
        boxShadow: '0 4px 12px -2px rgba(20, 163, 139, 0.25)',
        hover: {
          background: 'linear-gradient(135deg, #118C76 0%, #0B5E4C 100%)',
          boxShadow: '0 6px 16px -2px rgba(20, 163, 139, 0.35)',
        },
      },
      secondary: {
        background: 'transparent',
        color: '#14A38B',
        border: '2px solid #14A38B',
        borderRadius: '8px',
        padding: '10px 22px',
        fontWeight: 600,
        hover: {
          background: 'rgba(20, 163, 139, 0.05)',
        },
      },
      danger: {
        background: '#A94442',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px 24px',
        fontWeight: 600,
        hover: {
          background: '#943A38',
        },
      },
    },

    // Card Styles
    card: {
      base: {
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
      },
      glass: {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
      },
      elevated: {
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.12), 0 4px 8px -3px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
      },
    },

    // Input Styles
    input: {
      base: {
        background: '#FFFFFF',
        border: '2px solid #E8E8E8',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '1rem',
        color: '#333333',
        focus: {
          border: '2px solid #14A38B',
          boxShadow: '0 0 0 3px rgba(20, 163, 139, 0.1)',
        },
      },
    },

    // Badge Styles
    badge: {
      primary: {
        background: 'rgba(20, 163, 139, 0.1)',
        color: '#0E7561',
        borderRadius: '6px',
        padding: '4px 12px',
        fontWeight: 600,
        fontSize: '0.75rem',
      },
      secondary: {
        background: 'rgba(212, 165, 116, 0.1)',
        color: '#9E6A3D',
        borderRadius: '6px',
        padding: '4px 12px',
        fontWeight: 600,
        fontSize: '0.75rem',
      },
      success: {
        background: 'rgba(76, 175, 80, 0.1)',
        color: '#2E7D32',
        borderRadius: '6px',
        padding: '4px 12px',
        fontWeight: 600,
        fontSize: '0.75rem',
      },
      danger: {
        background: 'rgba(169, 68, 66, 0.1)',
        color: '#7F302E',
        borderRadius: '6px',
        padding: '4px 12px',
        fontWeight: 600,
        fontSize: '0.75rem',
      },
    },
  },

  // ==========================================
  // TRANSITIONS & ANIMATIONS
  // ==========================================
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ==========================================
  // ICON STYLES
  // ==========================================
  icons: {
    style: 'outline',        // Use outlined stroke style
    strokeWidth: 1.5,        // Thin, elegant strokes
    size: {
      xs: 16,
      sm: 20,
      base: 24,
      lg: 28,
      xl: 32,
    },
    colors: {
      default: '#666666',    // Subtle gray
      active: '#14A38B',     // Primary accent when active
      revenue: '#D4A574',    // Warm gold for revenue icons
      danger: '#A94442',     // Danger color for alerts
    },
  },

  // ==========================================
  // CHART COLORS
  // ==========================================
  charts: {
    primary: ['#14A38B', '#0E7561', '#084737'],              // Teal shades
    secondary: ['#D4A574', '#B47D4A', '#875730'],            // Gold shades
    mixed: ['#14A38B', '#D4A574', '#4CAF50', '#FFA726'],     // Balanced palette
    gradient: {
      teal: 'linear-gradient(135deg, #14A38B 0%, #0E7561 100%)',
      gold: 'linear-gradient(135deg, #D4A574 0%, #9E6A3D 100%)',
      success: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    },
  },

  // ==========================================
  // Z-INDEX SCALE
  // ==========================================
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Export individual sections for easy access
export const COLORS = PREMIUM_THEME.colors;
export const TYPOGRAPHY = PREMIUM_THEME.typography;
export const SPACING = PREMIUM_THEME.spacing;
export const SHADOWS = PREMIUM_THEME.shadows;
export const COMPONENTS = PREMIUM_THEME.components;

export default PREMIUM_THEME;
