import type { Cookies } from '@sveltejs/kit';
import { THEME_COOKIE, themeFromCookie, type ThemePreference } from '$lib/theme.shared';

const ONE_YEAR = 60 * 60 * 24 * 365;

export function readThemeCookie(cookies: Cookies): ThemePreference {
	return themeFromCookie(cookies.get(THEME_COOKIE));
}

export function writeThemeCookie(cookies: Cookies, preference: ThemePreference) {
	cookies.set(THEME_COOKIE, preference, {
		path: '/',
		maxAge: ONE_YEAR,
		httpOnly: false,
		sameSite: 'lax'
	});
}
