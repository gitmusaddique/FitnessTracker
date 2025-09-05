import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@shared/schema';

// Create separate SQLite database for admin
const adminSqlite = new Database('./admin.sqlite');
export const adminDb = drizzle(adminSqlite, { schema });

// Initialize admin database
export function initializeAdminDatabase() {
  try {
    // Enable foreign keys
    adminSqlite.exec('PRAGMA foreign_keys = ON;');
    
    // Create admin users table
    adminSqlite.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'super_admin',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    
    console.log('Admin SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing admin SQLite database:', error);
    throw error;
  }
}