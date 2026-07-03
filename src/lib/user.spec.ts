import { describe, expect, it } from 'vitest';
import { getUserDisplayName } from './user';

describe('getUserDisplayName', () => {
	it('returns trimmed name when present', () => {
		expect(getUserDisplayName({ name: '  Ada  ', email: 'ada@example.com' })).toBe('Ada');
	});

	it('falls back to email when name is empty', () => {
		expect(getUserDisplayName({ name: '   ', email: 'ada@example.com' })).toBe('ada@example.com');
	});

	it('falls back to email when name is missing', () => {
		expect(getUserDisplayName({ name: '', email: 'ada@example.com' })).toBe('ada@example.com');
	});
});
