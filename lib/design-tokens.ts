/**
 * Design Tokens - Système de design unifié
 * Inspiré du style iOS moderne avec glass morphism
 */

export const colors = {
  // Couleurs principales
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },

  // Gradients signature (comme dans l'inspiration)
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    warm: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cool: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    morning: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },

  // Couleurs de fond
  background: {
    DEFAULT: 'hsl(var(--background))',
    secondary: '#F5F5F7',
    card: 'rgba(255, 255, 255, 0.7)',
  },

  // Glass morphism
  glass: {
    light: 'rgba(255, 255, 255, 0.6)',
    medium: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(255, 255, 255, 0.4)',
  },
};

export const radius = {
  none: '0',
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  full: '9999px',
};

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(102, 126, 234, 0.4)',
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Classes CSS utilitaires pré-définies
 */
export const utilities = {
  // Gradients
  gradientClasses: {
    primary: 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600',
    warm: 'bg-gradient-to-br from-pink-400 via-red-400 to-yellow-400',
    cool: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    sunset: 'bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500',
    morning: 'bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200',
  },

  // Glass panels
  glassClasses: {
    light: 'bg-white/60 backdrop-blur-xl border border-white/20',
    medium: 'bg-white/80 backdrop-blur-2xl border border-white/30',
    dark: 'bg-white/40 backdrop-blur-lg border border-white/10',
  },

  // Shadows avec glow
  shadowClasses: {
    card: 'shadow-lg shadow-gray-900/5',
    cardHover: 'hover:shadow-xl hover:shadow-gray-900/10 transition-shadow',
    glow: 'shadow-xl shadow-purple-500/20',
  },
};
