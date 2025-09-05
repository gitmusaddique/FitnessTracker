import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@shared/schema';

// Create SQLite database
const sqlite = new Database('./database.sqlite');
export const db = drizzle(sqlite, { schema });

// Initialize database and run migrations
export function initializeDatabase() {
  try {
    // Enable foreign keys
    sqlite.exec('PRAGMA foreign_keys = ON;');
    
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  }
}