import { env } from '$env/dynamic/private';

export type TmdbMovieResult = {
	id: number;
	title: string;
	posterPath: string | null;
	releaseYear: string | null;
};

type TmdbSearchResponse = {
	results?: Array<{
		id: number;
		title: string;
		poster_path: string | null;
		release_date?: string;
	}>;
};

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
			headers: {
				Authorization: `Bearer ${apiKey}`,
				Accept: 'application/json'
			}
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
