import type { User } from 'better-auth';

function emailLocalPart(email: string): string {
	return email.split('@')[0] ?? email;
}

export function getUserDisplayName(user: Pick<User, 'name' | 'email'>): string {
	const name = user.name?.trim();
	if (name) return name;

	const local = emailLocalPart(user.email);
	return local.charAt(0).toUpperCase() + local.slice(1);
}

export function getUserInitials(user: Pick<User, 'name' | 'email'>): string {
	const name = user.name?.trim();
	if (name) {
		const parts = name.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return parts[0]?.charAt(0).toUpperCase() ?? '?';
	}

	const local = emailLocalPart(user.email);
	return local.charAt(0).toUpperCase() || '?';
}
