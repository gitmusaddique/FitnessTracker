import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../shared/schema';

// Create SQLite database
const sqlite = new Database('./database.sqlite');
export const db = drizzle(sqlite, { schema });

// Initialize database and run migrations
export function initializeDatabase() {
  try {
    // Enable foreign keys
    sqlite.exec('PRAGMA foreign_keys = ON;');
    
    // Create tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        calories INTEGER,
        distance REAL,
        notes TEXT,
        date INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        photo_url TEXT,
        calories INTEGER NOT NULL,
        notes TEXT,
        date INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS trainers (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        bio TEXT,
        price INTEGER NOT NULL,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        photo_url TEXT,
        location TEXT,
        contact TEXT
      );
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS gyms (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        price INTEGER NOT NULL,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        photo_url TEXT,
        amenities TEXT,
        hours TEXT,
        distance REAL
      );
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        trainer_id TEXT NOT NULL REFERENCES trainers(id),
        date INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);

    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  }
}