import type { User } from 'better-auth';

export function getUserDisplayName(user: Pick<User, 'name' | 'email'>): string {
	return user.name?.trim() || user.email;
}
