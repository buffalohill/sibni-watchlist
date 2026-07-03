import { describe, expect, it } from 'vitest';
import { sortMovies, type Movie } from './movies';

function movie(overrides: Partial<Movie> & Pick<Movie, 'id' | 'title'>): Movie {
	return {
		releaseYear: null,
		runtimeMinutes: null,
		genres: null,
		actors: null,
		createdAt: new Date('2024-01-01'),
		...overrides
	};
}

const sampleMovies: Movie[] = [
	movie({
		id: 1,
		title: 'Blade Runner',
		releaseYear: 1982,
		runtimeMinutes: 117,
		genres: ['Sci-Fi', 'Thriller'],
		actors: ['Harrison Ford', 'Rutger Hauer'],
		createdAt: new Date('2024-03-01')
	}),
	movie({
		id: 2,
		title: 'Arrival',
		releaseYear: 2016,
		runtimeMinutes: 116,
		genres: ['Sci-Fi', 'Drama'],
		actors: ['Amy Adams', 'Jeremy Renner'],
		createdAt: new Date('2024-02-01')
	}),
	movie({
		id: 3,
		title: 'Untitled',
		createdAt: new Date('2024-01-01')
	})
];

describe('sortMovies', () => {
	it('sorts by title ascending', () => {
		const sorted = sortMovies(sampleMovies, 'title', 'asc');
		expect(sorted.map((m) => m.title)).toEqual(['Arrival', 'Blade Runner', 'Untitled']);
	});

	it('sorts by release year descending with nulls last', () => {
		const sorted = sortMovies(sampleMovies, 'date', 'desc');
		expect(sorted.map((m) => m.releaseYear)).toEqual([2016, 1982, null]);
	});

	it('sorts by first genre alphabetically', () => {
		const sorted = sortMovies(sampleMovies, 'genre', 'asc');
		expect(sorted.map((m) => m.genres?.[0] ?? null)).toEqual(['Sci-Fi', 'Sci-Fi', null]);
	});

	it('sorts by runtime with nulls last', () => {
		const sorted = sortMovies(sampleMovies, 'length', 'asc');
		expect(sorted.map((m) => m.runtimeMinutes)).toEqual([116, 117, null]);
	});

	it('sorts by first billed actor', () => {
		const sorted = sortMovies(sampleMovies, 'actor', 'asc');
		expect(sorted.map((m) => m.actors?.[0] ?? null)).toEqual([
			'Amy Adams',
			'Harrison Ford',
			null
		]);
	});

	it('sorts by added date', () => {
		const sorted = sortMovies(sampleMovies, 'added', 'desc');
		expect(sorted.map((m) => m.id)).toEqual([1, 2, 3]);
	});
});
