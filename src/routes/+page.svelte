<script lang="ts">
	import { enhance } from '$app/forms';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { getUserDisplayName, getUserInitials } from '$lib/user';
	import type { ActionData, PageData } from './$types';
	import FilmStripIcon from 'phosphor-svelte/lib/FilmStripIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import SignOutIcon from 'phosphor-svelte/lib/SignOutIcon';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const displayName = $derived(getUserDisplayName(data.user));
	const initials = $derived(getUserInitials(data.user));
	const iconSize = 20;
</script>

<svelte:head>
	<title>Watchlist</title>
</svelte:head>

<main class="page">
	<header class="header">
		<h1>Watchlist</h1>
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
		<form method="post" action="?/addMovie" use:enhance class="add-bar">
			<input name="title" placeholder="Movie title" class="input" />
			<button type="submit" class="btn btn-primary" aria-label="Add movie">
				<PlusIcon size={iconSize} />
			</button>
		</form>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
	</section>

	<section class="card">
		{#if data.movies.length === 0}
			<p class="empty">No movies yet. Add one above.</p>
		{:else}
			<ul class="movie-list">
				{#each data.movies as movie (movie.id)}
					<li class="movie-item">
						<FilmStripIcon class="movie-item-icon" size={18} />
						{movie.title}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
