<script lang="ts">
	import {
		buildRecommendationBlurb,
		needsTmdbBackfill,
		type RecommendationMovie
	} from '$lib/recommendation';
	import { formatRuntime, posterUrl } from '$lib/tmdb';
	import FilmStripIcon from 'phosphor-svelte/lib/FilmStripIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { tick } from 'svelte';

	let {
		movie,
		variationKey = 0,
		onclose
	}: {
		movie: RecommendationMovie;
		variationKey?: number;
		onclose: () => void;
	} = $props();

	let closeButton: HTMLButtonElement | undefined = $state();
	let enrichedMovie = $state<RecommendationMovie>();
	let isLoadingBlurb = $state(false);

	const blurb = $derived(
		enrichedMovie ? buildRecommendationBlurb(enrichedMovie, { variationKey }) : ''
	);
	const runtime = $derived(enrichedMovie ? formatRuntime(enrichedMovie.runtimeMinutes) : null);
	const metaParts = $derived(
		enrichedMovie
			? [enrichedMovie.releaseYear?.toString(), enrichedMovie.genres?.join(' · '), runtime].filter(
					Boolean
				)
			: []
	);

	$effect(() => {
		enrichedMovie = { ...movie };
	});

	$effect(() => {
		if (!enrichedMovie || !needsTmdbBackfill(enrichedMovie)) return;

		const controller = new AbortController();
		isLoadingBlurb = true;

		void (async () => {
			const current = enrichedMovie;
			if (!current?.tmdbId) return;

			try {
				const response = await fetch(
					`/api/tmdb/movie/${current.tmdbId}?movieId=${current.id}`,
					{ signal: controller.signal }
				);

				if (!response.ok) return;

				const payload = (await response.json()) as {
					overview: string | null;
					tagline: string | null;
				};

				enrichedMovie = {
					...current,
					overview: payload.overview,
					tagline: payload.tagline
				};
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return;
			} finally {
				if (!controller.signal.aborted) {
					isLoadingBlurb = false;
				}
			}
		})();

		return () => {
			controller.abort();
		};
	});

	$effect(() => {
		const movieId = movie.id;
		void movieId;
		void tick().then(() => closeButton?.focus());
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<button type="button" class="menu-scrim" aria-label="Close recommendation" tabindex={-1} onclick={onclose}
></button>

<div
	class="recommendation-modal"
	role="dialog"
	aria-modal="true"
	aria-labelledby="recommendation-title"
>
	<button
		bind:this={closeButton}
		type="button"
		class="btn btn-secondary btn-icon recommendation-modal-close"
		aria-label="Close"
		onclick={onclose}
	>
		<XIcon size={18} />
	</button>

	{#if enrichedMovie}
		<div class="recommendation-modal-content">
			<div class="recommendation-modal-poster-wrap">
				{#if enrichedMovie.posterPath}
					<img
						src={posterUrl(enrichedMovie.posterPath, 'w342') ?? ''}
						alt=""
						class="recommendation-modal-poster"
					/>
				{:else}
					<div
						class="recommendation-modal-poster recommendation-modal-poster--placeholder"
						aria-hidden="true"
					>
						<FilmStripIcon size={40} />
					</div>
				{/if}
			</div>

			<div class="recommendation-modal-body">
				<h2 id="recommendation-title" class="recommendation-modal-title">{enrichedMovie.title}</h2>

				{#if metaParts.length > 0}
					<p class="recommendation-modal-meta">{metaParts.join(' · ')}</p>
				{/if}

				<p class="recommendation-modal-blurb">
					{#if isLoadingBlurb && needsTmdbBackfill(enrichedMovie)}
						Picking tonight's story…
					{:else}
						{blurb}
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>
