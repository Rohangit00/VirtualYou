// Enhanced RPG Theme for VirtualYou
export const COLORS = {
    // Deep fantasy backgrounds
    background: '#0A0A12',
    backgroundDark: '#050508',
    backgroundCard: 'rgba(20, 18, 35, 0.9)',
    backgroundCardBorder: 'rgba(139, 92, 246, 0.3)',

    // Rich gradient colors
    gradientPurple: ['#4C1D95', '#7C3AED', '#A78BFA'],
    gradientGold: ['#92400E', '#D97706', '#FCD34D'],
    gradientBlue: ['#1E3A8A', '#3B82F6', '#93C5FD'],
    gradientRed: ['#7F1D1D', '#DC2626', '#FCA5A5'],

    // Primary - Royal Purple
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#4C1D95',

    // Accent - Legendary Gold
    accent: '#FFD700',
    accentLight: '#FDE68A',
    accentDark: '#B45309',
    accentGlow: 'rgba(255, 215, 0, 0.4)',

    // XP colors with glow
    xpPositive: '#10B981',
    xpPositiveGlow: 'rgba(16, 185, 129, 0.4)',
    xpNegative: '#EF4444',
    xpNegativeGlow: 'rgba(239, 68, 68, 0.4)',

    // Avatar state colors - more vibrant
    thriving: '#FBBF24',
    thrivingGlow: 'rgba(251, 191, 36, 0.5)',
    healthy: '#34D399',
    healthyGlow: 'rgba(52, 211, 153, 0.4)',
    tired: '#60A5FA',
    tiredGlow: 'rgba(96, 165, 250, 0.3)',
    drained: '#6B7280',
    drainedGlow: 'rgba(107, 114, 128, 0.2)',

    // Text hierarchy
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#6B7280',
    textGold: '#FCD34D',

    // Ornate UI elements
    border: 'rgba(139, 92, 246, 0.4)',
    borderLight: 'rgba(167, 139, 250, 0.3)',
    borderGold: 'rgba(251, 191, 36, 0.5)',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    legendary: '#FBBF24',
    epic: '#A855F7',
    rare: '#3B82F6',
} as const;

export const FONTS = {
    heading: {
        fontWeight: '800' as const,
        fontSize: 26,
        letterSpacing: 1,
    },
    subheading: {
        fontWeight: '700' as const,
        fontSize: 18,
        letterSpacing: 0.5,
    },
    body: {
        fontWeight: '500' as const,
        fontSize: 16,
    },
    caption: {
        fontWeight: '500' as const,
        fontSize: 12,
        letterSpacing: 0.5,
    },
    stat: {
        fontWeight: '800' as const,
        fontSize: 32,
    },
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    card: 20,
    full: 9999,
} as const;

// Ornate border decorations
export const ORNATE_BORDER = {
    cornerSize: 12,
    borderWidth: 2,
};

// Shadow effects for depth
export const SHADOWS = {
    glow: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    goldGlow: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
} as const;
