<script lang="ts">
	import { setThemePreference, themePreference, type ThemePreference } from '$lib/theme';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import DesktopIcon from 'phosphor-svelte/lib/DesktopIcon';
	import MoonIcon from 'phosphor-svelte/lib/MoonIcon';
	import SunIcon from 'phosphor-svelte/lib/SunIcon';

	let { displayName, initials }: { displayName: string; initials: string } = $props();

	let menuOpen = $state(false);

	const iconSize = 16;
	const caretSize = 14;

	const themeOptions: { value: ThemePreference; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];

	function closeMenu() {
		menuOpen = false;
	}

	function selectTheme(preference: ThemePreference) {
		setThemePreference(preference);
		closeMenu();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menuOpen) closeMenu();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if menuOpen}
	<button
		type="button"
		class="menu-scrim"
		aria-label="Close menu"
		tabindex={-1}
		onclick={closeMenu}
	></button>
{/if}

<details class="user-menu" bind:open={menuOpen}>
	<summary class="user-badge" aria-label="Account menu for {displayName}">
		<span class="user-avatar" aria-hidden="true">{initials}</span>
		<span class="user-name">{displayName}</span>
		<CaretDownIcon size={caretSize} class="user-badge-caret" aria-hidden="true" />
	</summary>

	<div class="menu" role="menu" aria-label="Appearance">
		<p class="menu-label">Appearance</p>
		{#each themeOptions as option (option.value)}
			<button
				type="button"
				class="menu-item"
				role="menuitemradio"
				aria-checked={$themePreference === option.value}
				onclick={() => selectTheme(option.value)}
			>
				<span class="menu-item-leading">
					{#if option.value === 'system'}
						<DesktopIcon size={iconSize} />
					{:else if option.value === 'light'}
						<SunIcon size={iconSize} />
					{:else}
						<MoonIcon size={iconSize} />
					{/if}
					{option.label}
				</span>
				{#if $themePreference === option.value}
					<CheckIcon size={iconSize} class="menu-item-check" />
				{/if}
			</button>
		{/each}
	</div>
</details>
