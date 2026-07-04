import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { movie } from '$lib/server/db/schema';
import { fetchMovieDetails } from '$lib/server/tmdb';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const tmdbId = Number(params.tmdbId);
	if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
		return json({ error: 'Invalid movie id' }, { status: 400 });
	}

	const details = await fetchMovieDetails(tmdbId);
	if (!details) {
		return json({ error: 'Movie not found' }, { status: 404 });
	}

	const movieIdRaw = url.searchParams.get('movieId');
	const movieId = movieIdRaw ? Number(movieIdRaw) : null;

	if (movieId !== null && Number.isInteger(movieId) && movieId > 0) {
		await db
			.update(movie)
			.set({
				overview: details.overview,
				tagline: details.tagline
			})
			.where(and(eq(movie.id, movieId), eq(movie.userId, locals.user.id)));
	}

	return json({
		overview: details.overview,
		tagline: details.tagline
	});
};
