import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { THEME_COOKIE, isThemePreference, type ThemePreference } from '$lib/theme.shared';

const STORAGE_KEY = 'watchlist-theme';

function readCookie(): ThemePreference | null {
	if (!browser) return null;
	const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]+)`));
	return isThemePreference(match?.[1]) ? match[1] : null;
}

function readStoredPreference(): ThemePreference {
	if (!browser) return 'system';
	return readCookie() ?? themeFromStorage();
}

function themeFromStorage(): ThemePreference {
	const stored = localStorage.getItem(STORAGE_KEY);
	return isThemePreference(stored) ? stored : 'system';
}

export function applyThemePreference(preference: ThemePreference) {
	if (!browser) return;

	const root = document.documentElement;
	if (preference === 'system') {
		root.removeAttribute('data-theme');
	} else {
		root.setAttribute('data-theme', preference);
	}
}

export const themePreference = writable<ThemePreference>(readStoredPreference());

export function setThemePreference(preference: ThemePreference) {
	themePreference.set(preference);
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, preference);
	document.cookie = `${THEME_COOKIE}=${preference}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
	applyThemePreference(preference);
}

export function initTheme(preference?: ThemePreference) {
	const resolved = preference ?? readStoredPreference();
	themePreference.set(resolved);
	if (browser) {
		localStorage.setItem(STORAGE_KEY, resolved);
	}
	applyThemePreference(resolved);

	const media = window.matchMedia('(prefers-color-scheme: dark)');
	const onSystemChange = () => {
		themePreference.update((value) => {
			if (value === 'system') applyThemePreference('system');
			return value;
		});
	};

	media.addEventListener('change', onSystemChange);
	return () => media.removeEventListener('change', onSystemChange);
}

export type { ThemePreference } from '$lib/theme.shared';
