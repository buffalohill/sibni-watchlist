import { env } from '$env/dynamic/private';

export type TmdbMovieResult = {
	id: number;
	title: string;
	posterPath: string | null;
	releaseYear: string | null;
};

export type TmdbMovieDetails = {
	releaseYear: number | null;
	runtimeMinutes: number | null;
	genres: string[] | null;
	directors: string[] | null;
	actors: string[] | null;
	overview: string | null;
	tagline: string | null;
};

type TmdbSearchResponse = {
	results?: Array<{
		id: number;
		title: string;
		poster_path: string | null;
		release_date?: string;
	}>;
};

type TmdbMovieDetailsResponse = {
	release_date?: string;
	runtime?: number | null;
	overview?: string;
	tagline?: string;
	genres?: Array<{ name: string }>;
	credits?: {
		cast?: Array<{ name: string; order: number }>;
		crew?: Array<{ name: string; job: string }>;
	};
};

function normalizeText(value: string | undefined): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

const CAST_LIMIT = 4;

function tmdbHeaders(apiKey: string): HeadersInit {
	return {
		Authorization: `Bearer ${apiKey}`,
		Accept: 'application/json'
	};
}

export async function searchMovies(query: string, limit = 8): Promise<TmdbMovieResult[]> {
	const apiKey = env.TMDB_API_KEY;
	if (!apiKey) {
		console.error('TMDB_API_KEY is not set');
		return [];
	}

	const url = new URL('https://api.themoviedb.org/3/search/movie');
	url.searchParams.set('query', query);
	url.searchParams.set('include_adult', 'false');

	try {
		const response = await fetch(url, {
			headers: tmdbHeaders(apiKey)
		});

		if (!response.ok) {
			console.error(`TMDB search failed: ${response.status} ${response.statusText}`);
			return [];
		}

		const data = (await response.json()) as TmdbSearchResponse;

		return (data.results ?? []).slice(0, limit).map((movie) => ({
			id: movie.id,
			title: movie.title,
			posterPath: movie.poster_path,
			releaseYear: movie.release_date?.slice(0, 4) ?? null
		}));
	} catch (error) {
		console.error('TMDB search error:', error);
		return [];
	}
}

export async function fetchMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
	const apiKey = env.TMDB_API_KEY;
	if (!apiKey) {
		console.error('TMDB_API_KEY is not set');
		return null;
	}

	const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}`);
	url.searchParams.set('append_to_response', 'credits');

	try {
		const response = await fetch(url, {
			headers: tmdbHeaders(apiKey)
		});

		if (!response.ok) {
			console.error(`TMDB details failed: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = (await response.json()) as TmdbMovieDetailsResponse;
		const releaseYearRaw = data.release_date?.slice(0, 4);
		const releaseYear = releaseYearRaw ? Number(releaseYearRaw) : null;

		const genres = data.genres?.map((genre) => genre.name) ?? null;
		const directors =
			data.credits?.crew
				?.filter((member) => member.job === 'Director')
				.map((member) => member.name) ?? null;
		const actors =
			data.credits?.cast
				?.sort((a, b) => a.order - b.order)
				.slice(0, CAST_LIMIT)
				.map((member) => member.name) ?? null;

		return {
			releaseYear: releaseYear !== null && Number.isInteger(releaseYear) ? releaseYear : null,
			runtimeMinutes:
				typeof data.runtime === 'number' && data.runtime > 0 ? data.runtime : null,
			genres: genres && genres.length > 0 ? genres : null,
			directors: directors && directors.length > 0 ? directors : null,
			actors: actors && actors.length > 0 ? actors : null,
			overview: normalizeText(data.overview),
			tagline: normalizeText(data.tagline)
		};
	} catch (error) {
		console.error('TMDB details error:', error);
		return null;
	}
}
