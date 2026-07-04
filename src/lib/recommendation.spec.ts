import { describe, expect, it, vi } from 'vitest';
import {
	buildRecommendationBlurb,
	countUniqueHookCategoriesForMovie,
	needsTmdbBackfill,
	pickRandomMovie,
	type RecommendationMovie
} from './recommendation';

function movie(overrides: Partial<RecommendationMovie> & Pick<RecommendationMovie, 'id' | 'title'>): RecommendationMovie {
	return {
		tmdbId: null,
		posterPath: null,
		releaseYear: null,
		runtimeMinutes: null,
		genres: null,
		directors: null,
		actors: null,
		overview: null,
		tagline: null,
		createdAt: new Date('2024-01-01'),
		...overrides
	};
}

describe('pickRandomMovie', () => {
	it('returns null for an empty list', () => {
		expect(pickRandomMovie([])).toBeNull();
	});

	it('returns a movie from the list', () => {
		const movies = [
			movie({ id: 1, title: 'A' }),
			movie({ id: 2, title: 'B' }),
			movie({ id: 3, title: 'C' })
		];
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
		expect(pickRandomMovie(movies)?.id).toBe(2);
		vi.restoreAllMocks();
	});
});

describe('needsTmdbBackfill', () => {
	it('is true when tmdb id exists but copy is missing', () => {
		expect(
			needsTmdbBackfill(
				movie({ id: 1, title: 'Blade Runner', tmdbId: 78, overview: null, tagline: null })
			)
		).toBe(true);
	});

	it('is false when tagline or overview is present', () => {
		expect(
			needsTmdbBackfill(
				movie({ id: 1, title: 'Blade Runner', tmdbId: 78, tagline: 'A tagline' })
			)
		).toBe(false);
	});
});

describe('buildRecommendationBlurb', () => {
	const now = new Date('2026-07-04T20:00:00');

	it('uses watchlist age when the movie has been waiting over 30 days', () => {
		const blurb = buildRecommendationBlurb(
			movie({
				id: 1,
				title: 'Blade Runner',
				createdAt: new Date('2026-01-01'),
				tagline: 'Man has made his match… now it is his problem.'
			}),
			{ now, variationKey: 2 }
		);

		expect(blurb).toContain('Blade Runner');
		expect(blurb).toContain('about 6 months');
		expect(blurb).toContain('"Man has made his match… now it is his problem."');
	});

	it('uses a short runtime hook for recent additions', () => {
		const blurb = buildRecommendationBlurb(
			movie({
				id: 1,
				title: 'Before Sunrise',
				createdAt: new Date('2026-07-01'),
				runtimeMinutes: 85,
				overview: 'A young man and woman meet on a train in Europe.'
			}),
			{ now, variationKey: 2 }
		);

		expect(blurb).toContain('1h 25m');
		expect(blurb).toContain('A young man and woman meet on a train in Europe.');
	});

	it('rotates across hook types, not just runtime', () => {
		const sample = movie({
			id: 42,
			title: 'Blade Runner',
			createdAt: new Date('2026-07-01'),
			runtimeMinutes: 117,
			genres: ['Sci-Fi', 'Thriller'],
			actors: ['Harrison Ford'],
			directors: ['Ridley Scott'],
			releaseYear: 1982
		});

		const hooks = Array.from({ length: 8 }, (_, variationKey) =>
			buildRecommendationBlurb(sample, { now, variationKey }).split('.')[0]
		);

		const hasRuntime = hooks.some((hook) => /1h 57m|\d+h|\d+m/.test(hook));
		const hasGenre = hooks.some((hook) => /sci-fi|mind-bending/i.test(hook));
		const hasActor = hooks.some((hook) => /Harrison Ford/i.test(hook));
		const hasDirector = hooks.some((hook) => /Ridley Scott/i.test(hook));
		const hasEra = hooks.some((hook) => /1982|1980s/i.test(hook));

		expect(hasRuntime).toBe(true);
		expect(hasGenre).toBe(true);
		expect(hasActor).toBe(true);
		expect(hasDirector).toBe(true);
		expect(hasEra).toBe(true);
	});

	it('uses a long runtime hook for epics', () => {
		const blurb = buildRecommendationBlurb(
			movie({
				id: 1,
				title: 'Lawrence of Arabia',
				createdAt: new Date('2026-07-01'),
				runtimeMinutes: 227
			}),
			{ now, variationKey: 2 }
		);

		expect(blurb).toContain('3h 47m');
		expect(blurb).toContain('tonight');
	});

	it('uses weekend copy on Saturday', () => {
		const saturday = new Date('2026-07-04T14:00:00');
		const blurb = buildRecommendationBlurb(
			movie({
				id: 1,
				title: 'Paddington',
				createdAt: new Date('2026-07-03'),
				tagline: 'Please look after this bear.'
			}),
			{ now: saturday, variationKey: 1 }
		);

		expect(blurb).toMatch(/weekend|Saturday|Sunday|alarm tomorrow/i);
	});

	it('falls back to metadata when TMDB copy is missing', () => {
		const blurb = buildRecommendationBlurb(
			movie({
				id: 1,
				title: 'Local Film',
				createdAt: new Date('2026-07-03'),
				directors: ['Jane Doe'],
				actors: ['Alex Actor'],
				genres: ['Drama'],
				releaseYear: 2020
			}),
			{ now, variationKey: 0 }
		);

		expect(blurb).toContain('From director Jane Doe');
		expect(blurb).toContain('starring Alex Actor');
		expect(blurb).toContain('from 2020');
	});
});

describe('countUniqueHookCategoriesForMovie', () => {
	it('produces at least 10 unique hooks for the same short movie', () => {
		const sample = movie({
			id: 7,
			title: 'Quick Flick',
			createdAt: new Date('2026-07-01'),
			runtimeMinutes: 88,
			genres: ['Comedy'],
			actors: ['Alex Actor']
		});

		expect(
			countUniqueHookCategoriesForMovie(sample, new Date('2026-07-04T20:00:00'), 10)
		).toBeGreaterThanOrEqual(10);
	});
});
