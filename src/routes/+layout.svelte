<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { initTheme } from '$lib/theme';
	import '$lib/styles/index.css';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	onMount(() => initTheme(data.theme));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	{@render children()}
</div>
