import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const movie = pgTable('movie', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	tmdbId: integer('tmdb_id'),
	posterPath: text('poster_path'),
	releaseYear: integer('release_year'),
	runtimeMinutes: integer('runtime_minutes'),
	directors: text('directors').array(),
	actors: text('actors').array(),
	genres: text('genres').array(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export * from './auth.schema';
