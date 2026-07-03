const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w92' | 'w154' | 'w185';

export function posterUrl(
	posterPath: string | null | undefined,
	size: PosterSize = 'w154'
): string | null {
	if (!posterPath) return null;
	return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}
