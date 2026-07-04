import { formatRuntime } from '$lib/tmdb';

export type RecommendationMovie = {
	id: number;
	title: string;
	tmdbId: number | null;
	posterPath: string | null;
	releaseYear: number | null;
	runtimeMinutes: number | null;
	genres: string[] | null;
	directors: string[] | null;
	actors: string[] | null;
	overview: string | null;
	tagline: string | null;
	createdAt: Date;
};

export type BlurbOptions = {
	now?: Date;
	variationKey?: number;
};

const GENRE_MOODS: Record<string, string> = {
	Comedy: 'light-hearted',
	Horror: 'spine-tingling',
	Documentary: 'thought-provoking',
	Romance: 'romantic',
	Thriller: 'gripping',
	'Science Fiction': 'mind-bending',
	'Sci-Fi': 'mind-bending',
	Fantasy: 'magical',
	Action: 'high-energy',
	Drama: 'moving',
	Animation: 'delightful',
	Mystery: 'intriguing',
	War: 'powerful',
	Western: 'gritty',
	Music: 'musical',
	Family: 'feel-good'
};

const OVERVIEW_MAX_LENGTH = 200;

const WATCHLIST_LONG_HOOKS = [
	"You've had {title} on your list for {age} — tonight could be the night.",
	'{title} has been waiting {age}. Maybe tonight is finally the night.',
	'After {age} on your watchlist, {title} deserves a shot tonight.',
	'{title} has lingered for {age}. Clear an evening and go for it.',
	"You added {title} {age} ago — no better time than tonight.",
	'{title} has been patient for {age}. Reward it with a viewing tonight.',
	'It has been {age} since {title} joined your list. Tonight feels right.',
	'{title} has been sitting there for {age}. Break the streak tonight.',
	'Your watchlist has held {title} for {age}. Settle in tonight.',
	'{age} of waiting — {title} is ready when you are.',
	'{title} has been on deck for {age}. Make it happen tonight.',
	'Give {title} its moment — it has been waiting {age}.'
];

const WATCHLIST_SHORT_HOOKS = [
	"You've had {title} waiting for {age} — tonight's the night.",
	'{title} has been on your list for {age}. Perfect night to finally watch it.',
	'{age} in, and {title} is still waiting. Tonight could work.',
	'{title} joined your list {age} ago — worth a look tonight.',
	'After {age}, {title} is still unbeaten. Change that tonight.',
	'{title} has been queued for {age}. Pop it on tonight.',
	'Only {age} since you added {title} — but the timing feels right tonight.',
	'{title} has been bookmarked for {age}. Give it a spin tonight.',
	'{age} of anticipation for {title}. Tonight is as good as any.',
	'Your list has had {title} for {age}. Roll it tonight.',
	'{title} has waited {age} — not forever, but long enough.',
	'{age} on the shelf for {title}. Take it off tonight.'
];

const SHORT_RUNTIME_HOOKS = [
	'Only {runtime} — slips in easily tonight.',
	'A breezy {runtime} — low commitment, high reward.',
	'{runtime} flat — done before you know it.',
	'Quick one tonight: {runtime} and out.',
	'{runtime} is all it asks. Easy yes for tonight.',
	'Short and sweet at {runtime} — ideal for tonight.',
	'Wrap up your evening with a tight {runtime}.',
	'{runtime} goes by fast — perfect when you want something tonight.',
	'Not much time? {runtime} has you covered tonight.',
	'A lean {runtime} — no heavy lift for tonight.',
	'{runtime} and done. Simple plan for tonight.',
	'Light on the clock at {runtime} — still a great pick tonight.'
];

const MEDIUM_RUNTIME_HOOKS = [
	'A solid {runtime} watch for tonight.',
	'{runtime} of good company tonight.',
	'Set aside {runtime} — worth it tonight.',
	'Block out {runtime} and settle in tonight.',
	'{runtime} is a satisfying length for tonight.',
	'Not too long, not too short — {runtime} tonight.',
	'{runtime} gives you room to get into it tonight.',
	'A well-paced {runtime} for this evening.',
	'{runtime} should hit the sweet spot tonight.',
	'Enough time to sink in: {runtime} tonight.',
	'{runtime} — a proper watch without eating the whole night.',
	'Commit to {runtime} tonight. You will not regret it.'
];

const LONG_RUNTIME_HOOKS = [
	'Settle in for a {runtime} epic tonight.',
	'Clear the calendar — {runtime} of {title} awaits.',
	'A proper {runtime} commitment. Worth it for {title}.',
	'{runtime} is a journey. Tonight is a good night for it.',
	'Go big tonight: {runtime} with {title}.',
	'Make an event of it — {runtime} well spent.',
	'{runtime} means you are all in tonight. Good.',
	'Dim the lights — {runtime} ahead with {title}.',
	'Epic length, epic night: {runtime} of {title}.',
	'You have got {runtime}. Use them on {title} tonight.',
	'{runtime} is a statement. {title} earns it tonight.',
	'Long night, great film — {runtime} of {title}.'
];

const WEEKEND_HOOKS = [
	'Great weekend pick.',
	'Weekend vibes call for this one.',
	'Saturday or Sunday energy — this fits.',
	'Perfect for a lazy weekend watch.',
	'Weekend mode: activated.',
	'No alarm tomorrow — lean into it.',
	'Weekend nights were made for picks like this.',
	'Stretch out — it is the weekend.',
	'Your weekend watchlist hero, right here.',
	'Weekend + movie night = good call.',
	'Save the chores. It is the weekend.',
	'Weekend freedom means guilt-free viewing.'
];

const WEEKDAY_HOOKS = [
	'A solid midweek escape.',
	'Hump day deserves a good pick.',
	'Break up the week with this one tonight.',
	'Weeknight treat — you have earned it.',
	'Midweek reset via movie night.',
	'Nothing wrong with a weeknight watch.',
	'Unwind from the week so far.',
	'Tuesday, Wednesday, Thursday — all fair game.',
	'Weekday evenings need good picks too.',
	'Small rebellion against a busy week.',
	'Pause the week. Press play.',
	'Work can wait until tomorrow.'
];

const GENRE_MOOD_HOOKS = [
	'A {mood} {genre} pick for tonight.',
	'{genre} with a {mood} edge — tonight works.',
	'In the mood for something {mood}? This {genre} fits.',
	'Tonight calls for {mood} {genre}.',
	'A {mood} night deserves a {genre} like this.',
	'{mood}, {genre}, tonight — good combo.',
	'Lean into the {mood} {genre} energy tonight.',
	'{genre} fans: this one is {mood} and ready.',
	'If you want {mood}, this {genre} delivers tonight.',
	'{mood} viewing ahead — {genre} style.',
	'Your {genre} mood is {mood} tonight.',
	'{genre} night with a {mood} twist.'
];

const GENRE_PLAIN_HOOKS = [
	'A {genre} pick for tonight.',
	'Tonight feels like a {genre} kind of night.',
	'In the mood for {genre}? Start here.',
	'{genre} on the menu tonight.',
	'A classic {genre} choice for this evening.',
	'Let {genre} set the tone tonight.',
	'{genre} fans, this one is calling.',
	'Nothing beats a good {genre} tonight.',
	'{genre} energy for the win tonight.',
	'Tonight: {genre}, no notes.',
	'Queue up some {genre} for this evening.',
	'{genre} — simple, solid, tonight.'
];

const FALLBACK_HOOKS = [
	'A solid pick for tonight.',
	'Tonight could be the one.',
	'Sometimes the list knows. Trust it tonight.',
	'Random pick, good instincts — watch it tonight.',
	'The watchlist chose. You watch tonight.',
	'Not overthinking it — just press play tonight.',
	'Your list had a feeling about tonight.',
	'Go with your gut. It picked this for tonight.',
	"Tonight's watch, decided.",
	'No wrong time like tonight.',
	'The algorithm of chance says: tonight.',
	'Fortune favors the viewer tonight.'
];

const ACTOR_HOOKS = [
	'{actor} on screen tonight — hard to go wrong.',
	'You could do worse than {actor} tonight.',
	'{actor} carries this one. Worth a look tonight.',
	'Tonight is a good night for a {actor} performance.',
	'{actor} fans: this pick is for you tonight.',
	'Let {actor} set the mood tonight.',
	'{actor} energy tonight. Say yes.',
	'Press play for {actor} tonight.',
	'{actor} makes a strong case for watching tonight.',
	'A night with {actor} on screen sounds right.',
	'{actor} is reason enough to watch tonight.',
	'{title} and {actor} — good combo tonight.'
];

const DIRECTOR_HOOKS = [
	'{director} directed this — trust the vision tonight.',
	'A {director} film deserves your attention tonight.',
	'{director} at the helm. That is a solid bet tonight.',
	'Tonight calls for {director}’s touch.',
	'From {director} — usually a good sign tonight.',
	'{director} fans, this one is calling tonight.',
	'Let {director} steer the evening.',
	'{director} knows what they are doing. Watch tonight.',
	'A {director} pick for tonight. Simple.',
	'{title} under {director} — worth it tonight.',
	'{director} made this. You should see it tonight.',
	'Give {director} your evening tonight.'
];

const ERA_HOOKS = [
	'From {year} — still a great watch tonight.',
	'A {decade} film that holds up tonight.',
	'{year} called; tonight you answer.',
	'Revisit {decade} cinema tonight with {title}.',
	'Classic {decade} energy tonight.',
	'{year} on the marquee. Good enough for tonight.',
	'A slice of {decade} film history tonight.',
	'{decade} vibes, tonight’s viewing.',
	'From {year}, ready for tonight.',
	'{title} — {decade} and still worth it tonight.',
	'Throw it back to {year} tonight.',
	'{decade} night. {title} fits.'
];

const METADATA_FALLBACKS = [
	'{credits}.',
	'{credits} — worth your evening.',
	'Tonight: {credits}.',
	'Give it a shot: {credits}.',
	'{credits}, waiting on your watchlist.',
	'Still unseen: {credits}.',
	'{credits}. Tonight sounds right.',
	'On your list: {credits}.',
	'{credits} — ready when you are.',
	'You queued {credits}. Time to watch.',
	'{credits}. Press play tonight.',
	'{title} — {credits}.'
];

const TITLE_ONLY_FALLBACKS = [
	'{title} is waiting on your watchlist — give it a shot tonight.',
	'{title} has been patient. Watch it tonight.',
	'Your list says {title}. Listen tonight.',
	'{title} — still unseen. Fix that tonight.',
	'Tonight belongs to {title}.',
	'{title} earned its spot. Press play.',
	'Still on the list: {title}. Change that tonight.',
	'{title} is ready. Are you?',
	'One pick: {title}. One night: tonight.',
	'{title} — no more deferring.',
	'The watchlist whispers: {title}. Tonight.',
	'{title}. That is the whole plan tonight.'
];

function daysSince(date: Date, now: Date): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor((now.getTime() - date.getTime()) / msPerDay);
}

function formatWatchlistAge(days: number): string {
	if (days >= 365) {
		const years = Math.floor(days / 365);
		return years === 1 ? 'about a year' : `about ${years} years`;
	}
	if (days >= 60) {
		const months = Math.floor(days / 30);
		return months === 1 ? 'about a month' : `about ${months} months`;
	}
	if (days >= 14) {
		const weeks = Math.floor(days / 7);
		return weeks === 1 ? 'a week' : `${weeks} weeks`;
	}
	return `${days} days`;
}

function formatDecade(year: number): string {
	const decade = Math.floor(year / 10) * 10;
	return `${decade}s`;
}

function variantIndex(movie: RecommendationMovie, poolLength: number, variationKey: number): number {
	if (poolLength === 0) return 0;
	return (movie.id + variationKey) % poolLength;
}

function applyTemplate(template: string, values: Record<string, string>): string {
	return Object.entries(values).reduce(
		(text, [key, value]) => text.replaceAll(`{${key}}`, value),
		template
	);
}

function pickTemplate(
	templates: string[],
	movie: RecommendationMovie,
	values: Record<string, string>,
	variationKey: number
): string {
	const index = variantIndex(movie, templates.length, variationKey);
	return applyTemplate(templates[index] ?? templates[0], values);
}

function buildTodayHook(movie: RecommendationMovie, now: Date, variationKey: number): string {
	const daysOnList = daysSince(movie.createdAt, now);
	const values = { title: movie.title };
	const day = now.getDay();
	const isWeekend = day === 0 || day === 6;
	const candidates: Array<() => string> = [];

	if (daysOnList >= 14) {
		const age = formatWatchlistAge(daysOnList);
		const pool = daysOnList >= 60 ? WATCHLIST_LONG_HOOKS : WATCHLIST_SHORT_HOOKS;
		candidates.push(() => pickTemplate(pool, movie, { ...values, age }, variationKey));
	}

	const runtime = movie.runtimeMinutes;
	const formattedRuntime = formatRuntime(runtime);
	if (runtime != null && runtime > 0 && formattedRuntime) {
		const pool =
			runtime < 100
				? SHORT_RUNTIME_HOOKS
				: runtime > 150
					? LONG_RUNTIME_HOOKS
					: MEDIUM_RUNTIME_HOOKS;
		candidates.push(() =>
			pickTemplate(pool, movie, { ...values, runtime: formattedRuntime }, variationKey)
		);
	}

	if (isWeekend) {
		candidates.push(() => pickTemplate(WEEKEND_HOOKS, movie, values, variationKey));
	} else {
		candidates.push(() => pickTemplate(WEEKDAY_HOOKS, movie, values, variationKey));
	}

	const primaryGenre = movie.genres?.[0];
	if (primaryGenre) {
		const mood = GENRE_MOODS[primaryGenre];
		if (mood) {
			candidates.push(() =>
				pickTemplate(
					GENRE_MOOD_HOOKS,
					movie,
					{ genre: primaryGenre.toLowerCase(), mood },
					variationKey
				)
			);
		} else {
			candidates.push(() =>
				pickTemplate(
					GENRE_PLAIN_HOOKS,
					movie,
					{ genre: primaryGenre.toLowerCase() },
					variationKey
				)
			);
		}
	}

	const leadActor = movie.actors?.[0];
	if (leadActor) {
		candidates.push(() =>
			pickTemplate(ACTOR_HOOKS, movie, { actor: leadActor, ...values }, variationKey)
		);
	}

	const director = movie.directors?.[0];
	if (director) {
		candidates.push(() =>
			pickTemplate(DIRECTOR_HOOKS, movie, { director, ...values }, variationKey)
		);
	}

	if (movie.releaseYear) {
		const decade = formatDecade(movie.releaseYear);
		candidates.push(() =>
			pickTemplate(
				ERA_HOOKS,
				movie,
				{ year: String(movie.releaseYear), decade, ...values },
				variationKey
			)
		);
	}

	candidates.push(() => pickTemplate(FALLBACK_HOOKS, movie, values, variationKey));

	const categoryIndex = (movie.id + variationKey) % candidates.length;
	return candidates[categoryIndex]();
}

function truncateOverview(overview: string): string {
	const trimmed = overview.trim();
	if (trimmed.length <= OVERVIEW_MAX_LENGTH) return trimmed;

	const slice = trimmed.slice(0, OVERVIEW_MAX_LENGTH);
	const lastSpace = slice.lastIndexOf(' ');
	const truncated = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
	return `${truncated}…`;
}

function buildCreditsLine(movie: RecommendationMovie): string | null {
	const parts: string[] = [];

	if (movie.directors?.length) {
		const directorLabel = movie.directors.length === 1 ? 'From director' : 'From directors';
		parts.push(`${directorLabel} ${movie.directors.join(' and ')}`);
	}

	if (movie.actors?.length) {
		parts.push(`starring ${movie.actors.slice(0, 2).join(' and ')}`);
	}

	if (movie.genres?.length) {
		parts.push(`a ${movie.genres.slice(0, 2).join(' · ').toLowerCase()} film`);
	}

	if (movie.releaseYear) {
		parts.push(`from ${movie.releaseYear}`);
	}

	if (parts.length === 0) return null;

	const sentence = parts.join(', ');
	return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function buildAwesomePart(
	movie: RecommendationMovie,
	variationKey: number
): string {
	if (movie.tagline) {
		return `"${movie.tagline}"`;
	}

	if (movie.overview) {
		return truncateOverview(movie.overview);
	}

	const credits = buildCreditsLine(movie);
	if (credits) {
		return pickTemplate(
			METADATA_FALLBACKS,
			movie,
			{ title: movie.title, credits },
			variationKey
		);
	}

	return pickTemplate(
		TITLE_ONLY_FALLBACKS,
		movie,
		{ title: movie.title },
		variationKey
	);
}

export function pickRandomMovie<T extends RecommendationMovie>(movies: T[]): T | null {
	if (movies.length === 0) return null;
	const index = Math.floor(Math.random() * movies.length);
	return movies[index] ?? null;
}

export function buildRecommendationBlurb(
	movie: RecommendationMovie,
	options: BlurbOptions = {}
): string {
	const now = options.now ?? new Date();
	const variationKey = options.variationKey ?? 0;
	const hook = buildTodayHook(movie, now, variationKey);
	const awesome = buildAwesomePart(movie, variationKey);
	return `${hook} ${awesome}`;
}

export function needsTmdbBackfill(movie: RecommendationMovie): boolean {
	return movie.tmdbId != null && !movie.tagline && !movie.overview;
}

export function countUniqueHookCategoriesForMovie(
	movie: RecommendationMovie,
	now: Date,
	count: number
): number {
	const hooks = new Set<string>();
	for (let variationKey = 0; variationKey < count; variationKey += 1) {
		hooks.add(buildTodayHook(movie, now, variationKey));
	}
	return hooks.size;
}
