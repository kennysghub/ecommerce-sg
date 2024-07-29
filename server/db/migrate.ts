import { migrate } from 'drizzle-orm/sqlite-core/migrator';
import { db } from './db';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// initialize sqlite database
const sqlite = new Database('./server/db/sqlite.db');
const drizzleDB = drizzle(sqlite);

// this will automatically run needed migrations on the database
async function main() {
  console.log('Running migrations...');
  await migrate(drizzleDB, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error performing migration:', err);
  process.exit(1);
});
