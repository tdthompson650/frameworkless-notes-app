/**
 * Applies SQL files from `src/migrations` in numeric filename order; records names in `schema_migrations`.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { db } from '../db.js';

const migrationsDir = fileURLToPath(
	new URL('../migrations', import.meta.url)
);

async function ensureMigrationsTable(): Promise<void> {
	await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrationNames(): Promise<Set<string>> {
	const result = await db.query<{ name: string }>(`
    SELECT name
    FROM schema_migrations
    ORDER BY name ASC
  `);

	return new Set(result.rows.map((row) => row.name));
}

async function getMigrationFileNames(): Promise<string[]> {
	const entries = await readdir(migrationsDir, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
		.map((entry) => entry.name)
		.sort((left, right) => {
			// Numeric prefix (e.g. 0001 … 0005), not lexicographic: "00005" must run after "0004".
			const leftNumber = Number.parseInt(left.split('_')[0] ?? '', 10);
			const rightNumber = Number.parseInt(right.split('_')[0] ?? '', 10);

			if (Number.isNaN(leftNumber) || Number.isNaN(rightNumber)) {
				return left.localeCompare(right);
			}

			return leftNumber - rightNumber;
		});
}

async function applyMigration(name: string): Promise<void> {
	const migrationPath = path.join(migrationsDir, name);
	const sql = await readFile(migrationPath, 'utf8');

	const client = await db.connect();

	try {
		await client.query('BEGIN');
		await client.query(sql);
		await client.query(
			`
        INSERT INTO schema_migrations (name)
        VALUES ($1)
      `,
			[name]
		);
		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

async function migrate(): Promise<void> {
	await ensureMigrationsTable();

	const [appliedMigrationNames, migrationFileNames] = await Promise.all([
		getAppliedMigrationNames(),
		getMigrationFileNames(),
	]);

	const pendingMigrationNames = migrationFileNames.filter(
		(name) => !appliedMigrationNames.has(name)
	);

	if (pendingMigrationNames.length === 0) {
		console.log('No pending migrations.');
		return;
	}

	for (const name of pendingMigrationNames) {
		console.log(`Applying migration: ${name}`);
		await applyMigration(name);
	}

	console.log(`Applied ${pendingMigrationNames.length} migration(s).`);
}

void migrate()
	.catch((error: unknown) => {
		console.error('Migration failed:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await db.end();
	});