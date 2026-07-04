const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500';

export function posterUrl(
	posterPath: string | null | undefined,
	size: PosterSize = 'w154'
): string | null {
	if (!posterPath) return null;
	return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function formatRuntime(minutes: number | null | undefined): string | null {
	if (minutes == null || minutes <= 0) return null;

	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;

	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}
