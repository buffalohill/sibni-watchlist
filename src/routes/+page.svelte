<script lang="ts">
	import { enhance } from '$app/forms';
	import { getUserDisplayName } from '$lib/user';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const displayName = $derived(getUserDisplayName(data.user));
</script>

<svelte:head>
	<title>Watchlist</title>
</svelte:head>

<main class="page">
	<header class="header">
		<div>
			<h1>Watchlist</h1>
			<p class="greeting">Hi, {displayName}</p>
		</div>
		<form method="post" action="?/signOut" use:enhance>
			<button type="submit" class="btn btn-secondary">Sign out</button>
		</form>
	</header>

	<section class="card">
		<h2 class="section-title">Add a movie</h2>
		<form method="post" action="?/addMovie" use:enhance class="form-row">
			<input name="title" placeholder="Movie title" class="input" />
			<button type="submit" class="btn btn-primary">Add</button>
		</form>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
	</section>

	<section class="card">
		<h2 class="section-title">Your movies</h2>
		{#if data.movies.length === 0}
			<p class="empty">No movies yet. Add one above.</p>
		{:else}
			<ul class="movie-list">
				{#each data.movies as movie (movie.id)}
					<li class="movie-item">{movie.title}</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
