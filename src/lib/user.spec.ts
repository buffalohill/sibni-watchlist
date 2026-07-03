import { describe, expect, it } from 'vitest';
import { getUserDisplayName, getUserInitials } from './user';

describe('getUserDisplayName', () => {
	it('returns trimmed name when present', () => {
		expect(getUserDisplayName({ name: '  Ada  ', email: 'ada@example.com' })).toBe('Ada');
	});

	it('falls back to capitalized email local part when name is empty', () => {
		expect(getUserDisplayName({ name: '   ', email: 'ada@example.com' })).toBe('Ada');
	});

	it('falls back to capitalized email local part when name is missing', () => {
		expect(getUserDisplayName({ name: '', email: 'buffalohill@me.com' })).toBe('Buffalohill');
	});
});

describe('getUserInitials', () => {
	it('uses first and last initials for multi-word names', () => {
		expect(getUserInitials({ name: 'Ada Lovelace', email: 'ada@example.com' })).toBe('AL');
	});

	it('uses up to two characters for single-word names', () => {
		expect(getUserInitials({ name: 'Ada', email: 'ada@example.com' })).toBe('A');
	});

	it('falls back to first letter of email local part', () => {
		expect(getUserInitials({ name: '', email: 'buffalohill@me.com' })).toBe('B');
	});
});
