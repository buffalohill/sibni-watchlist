export type SortField = 'added' | 'title' | 'date' | 'genre' | 'length' | 'actor';
export type SortOrder = 'asc' | 'desc';

export type Movie = {
	id: number;
	title: string;
	releaseYear: number | null;
	runtimeMinutes: number | null;
	genres: string[] | null;
	actors: string[] | null;
	createdAt: Date;
};

function sortKey(movie: Movie, sortBy: SortField): string | number | null {
	switch (sortBy) {
		case 'added':
			return movie.createdAt.getTime();
		case 'title':
			return movie.title.toLowerCase();
		case 'date':
			return movie.releaseYear;
		case 'genre':
			return movie.genres?.[0]?.toLowerCase() ?? null;
		case 'length':
			return movie.runtimeMinutes;
		case 'actor':
			return movie.actors?.[0]?.toLowerCase() ?? null;
	}
}

function compareValues(
	a: string | number | null,
	b: string | number | null,
	order: SortOrder
): number {
	if (a == null && b == null) return 0;
	if (a == null) return 1;
	if (b == null) return -1;

	let result: number;
	if (typeof a === 'number' && typeof b === 'number') {
		result = a - b;
	} else {
		result = String(a).localeCompare(String(b));
	}

	return order === 'asc' ? result : -result;
}

export function sortMovies<T extends Movie>(movies: T[], sortBy: SortField, order: SortOrder): T[] {
	return [...movies]
		.map((movie, index) => ({ movie, index }))
		.sort((a, b) => {
			const result = compareValues(sortKey(a.movie, sortBy), sortKey(b.movie, sortBy), order);
			return result !== 0 ? result : a.index - b.index;
		})
		.map(({ movie }) => movie);
}
