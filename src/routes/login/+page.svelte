<script lang="ts">
	import { enhance } from '$app/forms';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import type { ActionData } from './$types';
	import SignInIcon from 'phosphor-svelte/lib/SignInIcon';
	import UserPlusIcon from 'phosphor-svelte/lib/UserPlusIcon';

	let { form }: { form: ActionData } = $props();

	const iconSize = 18;
</script>

<svelte:head>
	<title>Login · Watchlist</title>
</svelte:head>

<main class="page page--centered">
	<div class="card card--auth">
		<div class="auth-brand">
			<AppLogo size="lg" href={null} />
		</div>
		<h1 class="auth-title">Login</h1>
		<form method="post" action="?/signInEmail" use:enhance class="form-stack">
			<label class="field">
				Email
				<input type="email" name="email" class="input" autocomplete="email" required />
			</label>
			<label class="field">
				Password
				<input
					type="password"
					name="password"
					class="input"
					autocomplete="current-password"
					required
				/>
			</label>
			<label class="field">
				Name (for registration)
				<input name="name" class="input" autocomplete="name" />
			</label>
			<div class="form-actions">
				<button type="submit" class="btn btn-primary">
					<SignInIcon size={iconSize} />
					Login
				</button>
				<button type="submit" class="btn btn-secondary" formaction="?/signUpEmail">
					<UserPlusIcon size={iconSize} />
					Register
				</button>
			</div>
		</form>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
	</div>
</main>
