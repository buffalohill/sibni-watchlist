import { readThemeCookie } from '$lib/server/theme';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return {
		theme: readThemeCookie(cookies)
	};
};
