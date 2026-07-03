import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UserMenu from './UserMenu.svelte';
import { get } from 'svelte/store';
import { setThemePreference, themePreference } from '$lib/theme';

describe('UserMenu', () => {
	it('opens the appearance menu when the account button is clicked', async () => {
		render(UserMenu, { props: { displayName: 'Ada', initials: 'A' } });

		await page.getByText('Ada', { exact: true }).click();

		await expect.element(page.getByRole('menuitemradio', { name: 'Light' })).toBeVisible();
	});

	it('changes theme when a menu item is clicked', async () => {
		setThemePreference('system');
		render(UserMenu, { props: { displayName: 'Ada', initials: 'A' } });

		await page.getByText('Ada', { exact: true }).click();
		await page.getByRole('menuitemradio', { name: 'Dark' }).click();

		expect(get(themePreference)).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});
});
