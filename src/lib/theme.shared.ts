export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_COOKIE = 'watchlist-theme';

export function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'system' || value === 'light' || value === 'dark';
}

export function themeFromCookie(value: string | undefined): ThemePreference {
	return isThemePreference(value) ? value : 'system';
}
