import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchMovies } from '$lib/server/tmdb';

const MIN_QUERY_LENGTH = 2;

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const query = url.searchParams.get('q')?.trim() ?? '';

	if (query.length < MIN_QUERY_LENGTH) {
		return json({ results: [] });
	}

	const results = await searchMovies(query);
	return json({ results });
};
