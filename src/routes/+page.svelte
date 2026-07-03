<script lang="ts">
	import { enhance } from '$app/forms';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { sortMovies, type SortField, type SortOrder } from '$lib/movies';
	import { posterUrl, formatRuntime } from '$lib/tmdb';
	import { getUserDisplayName, getUserInitials } from '$lib/user';
	import type { ActionData, PageData } from './$types';
	import FilmStripIcon from 'phosphor-svelte/lib/FilmStripIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import SignOutIcon from 'phosphor-svelte/lib/SignOutIcon';
	import SortAscendingIcon from 'phosphor-svelte/lib/SortAscendingIcon';
	import SortDescendingIcon from 'phosphor-svelte/lib/SortDescendingIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';

	type SearchResult = {
		id: number;
		title: string;
		posterPath: string | null;
		releaseYear: string | null;
	};

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const displayName = $derived(getUserDisplayName(data.user));
	const initials = $derived(getUserInitials(data.user));
	const iconSize = 20;

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let highlightedIndex = $state(-1);
	let isOpen = $state(false);
	let isSearching = $state(false);
	let addForm: HTMLFormElement | undefined = $state();
	let searchAbort: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	let sortBy = $state<SortField>('added');
	let sortOrder = $state<SortOrder>('desc');

	const displayedMovies = $derived(sortMovies(data.movies, sortBy, sortOrder));

	const showResults = $derived(
		isOpen && query.trim().length >= 2 && (results.length > 0 || isSearching)
	);

	function resetSearch() {
		query = '';
		results = [];
		highlightedIndex = -1;
		isOpen = false;
		isSearching = false;
	}

	function scheduleSearch(value: string) {
		clearTimeout(debounceTimer);
		searchAbort?.abort();

		const trimmed = value.trim();
		if (trimmed.length < 2) {
			results = [];
			highlightedIndex = -1;
			isSearching = false;
			return;
		}

		isSearching = true;
		debounceTimer = setTimeout(() => {
			void fetchResults(trimmed);
		}, 300);
	}

	async function fetchResults(value: string) {
		const controller = new AbortController();
		searchAbort = controller;

		try {
			const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(value)}`, {
				signal: controller.signal
			});

			if (!response.ok) {
				results = [];
				return;
			}

			const payload = (await response.json()) as { results: SearchResult[] };
			results = payload.results;
			highlightedIndex = payload.results.length > 0 ? 0 : -1;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			results = [];
			highlightedIndex = -1;
		} finally {
			if (searchAbort === controller) {
				isSearching = false;
			}
		}
	}

	function submitMovie(title: string, tmdbId?: number, posterPath?: string | null) {
		if (!addForm) return;

		const titleInput = addForm.querySelector<HTMLInputElement>('input[name="title"]');
		const tmdbIdInput = addForm.querySelector<HTMLInputElement>('input[name="tmdbId"]');
		const posterPathInput = addForm.querySelector<HTMLInputElement>('input[name="posterPath"]');

		if (!titleInput || !tmdbIdInput || !posterPathInput) return;

		titleInput.value = title;
		tmdbIdInput.value = tmdbId != null ? String(tmdbId) : '';
		posterPathInput.value = posterPath ?? '';
		addForm.requestSubmit();
	}

	function selectResult(result: SearchResult) {
		submitMovie(result.title, result.id, result.posterPath);
	}

	function handleInput(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		query = value;
		isOpen = true;
		scheduleSearch(value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showResults && event.key === 'Enter' && query.trim()) {
			event.preventDefault();
			submitMovie(query.trim());
			return;
		}

		if (!showResults) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (results.length === 0) return;
			highlightedIndex = (highlightedIndex + 1) % results.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (results.length === 0) return;
			highlightedIndex = highlightedIndex <= 0 ? results.length - 1 : highlightedIndex - 1;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (highlightedIndex >= 0 && results[highlightedIndex]) {
				selectResult(results[highlightedIndex]);
			} else if (query.trim()) {
				submitMovie(query.trim());
			}
		} else if (event.key === 'Escape') {
			isOpen = false;
			highlightedIndex = -1;
		}
	}

	function handleBlur(event: FocusEvent) {
		const related = event.relatedTarget as Node | null;
		if (related && (event.currentTarget as HTMLElement).parentElement?.contains(related)) return;
		isOpen = false;
	}
</script>

<svelte:head>
	<title>Watchlist</title>
</svelte:head>

<main class="page">
	<header class="header">
		<h1 class="header-title">
			<AppLogo />
		</h1>
		<div class="header-actions">
			<UserMenu {displayName} {initials} />
			<form method="post" action="?/signOut" use:enhance>
				<button type="submit" class="btn btn-secondary btn-icon" aria-label="Sign out">
					<SignOutIcon size={iconSize} />
				</button>
			</form>
		</div>
	</header>

	<section class="card">
		<h2 class="section-title">Add a movie</h2>
		<div class="typeahead">
			<form
				bind:this={addForm}
				method="post"
				action="?/addMovie"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						resetSearch();
					};
				}}
				class="add-bar"
			>
				<input type="hidden" name="tmdbId" value="" />
				<input type="hidden" name="posterPath" value="" />
				<input
					name="title"
					placeholder="Movie title"
					class="input"
					autocomplete="off"
					aria-autocomplete="list"
					aria-expanded={showResults}
					aria-controls="movie-search-results"
					bind:value={query}
					oninput={handleInput}
					onkeydown={handleKeydown}
					onfocus={() => {
						isOpen = true;
						scheduleSearch(query);
					}}
					onblur={handleBlur}
				/>
				<button
					type="button"
					class="btn btn-primary"
					aria-label="Add movie"
					onclick={() => {
						if (query.trim()) submitMovie(query.trim());
					}}
				>
					<PlusIcon size={iconSize} />
				</button>
			</form>

			{#if showResults}
				<ul id="movie-search-results" class="typeahead-results" role="listbox">
					{#if isSearching && results.length === 0}
						<li class="typeahead-status">Searching…</li>
					{:else}
						{#each results as result, index (result.id)}
							<li>
								<button
									type="button"
									class="typeahead-result"
									class:typeahead-result-active={index === highlightedIndex}
									role="option"
									aria-selected={index === highlightedIndex}
									onmousedown={(event) => event.preventDefault()}
									onclick={() => selectResult(result)}
								>
									{#if result.posterPath}
										<img
											src={posterUrl(result.posterPath, 'w92') ?? ''}
											alt=""
											class="typeahead-result-poster"
											loading="lazy"
										/>
									{:else}
										<FilmStripIcon class="typeahead-result-icon" size={18} />
									{/if}
									<span class="typeahead-result-title">{result.title}</span>
									{#if result.releaseYear}
										<span class="typeahead-result-year">{result.releaseYear}</span>
									{/if}
								</button>
							</li>
						{/each}
					{/if}
				</ul>
			{/if}
		</div>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
	</section>

	<section class="card">
		{#if data.movies.length === 0}
			<p class="empty">No movies yet. Add one above.</p>
		{:else}
			<div class="list-controls">
				<div class="sort-controls">
					<select id="sort-by" class="sort-select" aria-label="Sort by" bind:value={sortBy}>
						<option value="added">Date added</option>
						<option value="title">Title</option>
						<option value="date">Date</option>
						<option value="genre">Genre</option>
						<option value="length">Length</option>
						<option value="actor">Main actor</option>
					</select>
					<button
						type="button"
						class="btn btn-secondary btn-icon sort-order-btn"
						aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
						onclick={() => {
							sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
						}}
					>
						{#if sortOrder === 'asc'}
							<SortAscendingIcon size={18} />
						{:else}
							<SortDescendingIcon size={18} />
						{/if}
					</button>
				</div>
			</div>

			<ul class="movie-list">
				{#each displayedMovies as movie (movie.id)}
					{@const runtime = formatRuntime(movie.runtimeMinutes)}
					{@const metaParts = [
						movie.releaseYear?.toString(),
						movie.genres?.join(' · '),
						runtime
					].filter(Boolean)}
					<li class="movie-item">
						{#if movie.posterPath}
							<img
								src={posterUrl(movie.posterPath) ?? ''}
								alt=""
								class="movie-item-poster"
								loading="lazy"
							/>
						{:else}
							<span class="movie-item-thumb" aria-hidden="true">
								<FilmStripIcon size={22} />
							</span>
						{/if}
						<div class="movie-item-content">
							<h3 class="movie-item-title">{movie.title}</h3>
							{#if metaParts.length > 0}
								<p class="movie-item-meta">{metaParts.join(' · ')}</p>
							{/if}
							{#if movie.directors?.length}
								<p class="movie-item-detail">
									<span class="movie-item-detail-label">Director:</span>
									{movie.directors.join(', ')}
								</p>
							{/if}
							{#if movie.actors?.length}
								<p class="movie-item-detail">
									<span class="movie-item-detail-label">Starring:</span>
									{movie.actors.join(', ')}
								</p>
							{/if}
						</div>
						<form method="post" action="?/deleteMovie" use:enhance>
							<input type="hidden" name="id" value={movie.id} />
							<button
								type="submit"
								class="btn btn-secondary btn-icon movie-item-delete"
								aria-label="Delete {movie.title}"
							>
								<TrashIcon size={iconSize} />
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
