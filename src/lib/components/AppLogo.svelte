<script lang="ts">
	import FilmSlateIcon from 'phosphor-svelte/lib/FilmSlateIcon';

	let {
		size = 'md',
		href = '/'
	}: {
		size?: 'md' | 'lg';
		href?: string | null;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	class="app-logo"
	class:app-logo--lg={size === 'lg'}
	href={href ?? undefined}
	aria-label={href ? 'Watchlist home' : undefined}
>
	<span class="app-logo-lockup">
		<FilmSlateIcon class="app-logo-icon" size="1em" weight="bold" aria-hidden="true" />
		<span class="app-logo-wordmark" aria-hidden={!!href}>Watchlist</span>
	</span>
</svelte:element>
