export const colors = {
  bg: '#090A0F',
  surface: '#11131B',
  elevated: '#171A24',
  text: '#F5F5F7',
  textSecondary: '#9295A3',
  accent: '#A78BFA',
  accentDim: 'rgba(167,139,250,0.16)',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  hairline: 'rgba(255,255,255,0.06)',
  stroke: 'rgba(255,255,255,0.08)',
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'Sora_700Bold',
  displayHeavy: 'Sora_800ExtraBold',
  displaySemi: 'Sora_600SemiBold',
} as const;

export function fontForWeight(w: unknown): string {
  const n = typeof w === 'number' ? w : w === 'bold' ? 700 : Number(w) || 400;
  if (n >= 800) return font.bold;
  if (n >= 700) return font.bold;
  if (n >= 600) return font.semibold;
  if (n >= 500) return font.medium;
  return font.regular;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 } as const;

export const type = {
  display: { fontFamily: font.displayHeavy, fontSize: 32, letterSpacing: -1.2, lineHeight: 38, color: colors.text },
  title: { fontFamily: font.display, fontSize: 21, letterSpacing: -0.5, color: colors.text },
  heading: { fontFamily: font.semibold, fontSize: 16, letterSpacing: -0.2, color: colors.text },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  caption: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  overline: {
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  },
};

export const statusColor: Record<string, string> = {
  confirmed: colors.success,
  released: colors.success,
  estimated: colors.warning,
  announced: colors.accent,
  delayed: colors.warning,
  cancelled: colors.error,
  unverified: colors.textSecondary,
};

export const kindColor: Record<string, string> = {
  cinema: '#F472B6',
  digital: '#60A5FA',
  streaming: '#34D399',
  season_premiere: '#A78BFA',
  episode: '#A78BFA',
  finale: '#FBBF24',
};
