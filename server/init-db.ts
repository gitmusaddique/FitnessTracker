import { db } from './db';
import { sql } from 'drizzle-orm';

// Create all tables
async function initializeTables() {
  try {
    // Create users table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        age INTEGER,
        height REAL,
        weight REAL,
        gender TEXT,
        activity_level TEXT,
        fitness_goal TEXT,
        target_weight REAL,
        daily_calorie_goal INTEGER DEFAULT 2000,
        workout_streak INTEGER DEFAULT 0,
        total_workouts INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        is_verified INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create workouts table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        duration INTEGER NOT NULL,
        calories INTEGER,
        distance REAL,
        intensity TEXT,
        exercises TEXT,
        personal_record INTEGER DEFAULT 0,
        notes TEXT,
        mood TEXT,
        difficulty INTEGER,
        muscle_groups TEXT,
        equipment TEXT,
        location TEXT,
        visibility TEXT DEFAULT 'private',
        date INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create meals table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        photo_url TEXT,
        calories INTEGER NOT NULL,
        protein REAL,
        carbs REAL,
        fat REAL,
        fiber REAL,
        sugar REAL,
        sodium REAL,
        foods TEXT,
        notes TEXT,
        rating INTEGER,
        visibility TEXT DEFAULT 'private',
        date INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create trainers table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS trainers (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        specialty TEXT NOT NULL,
        bio TEXT,
        experience INTEGER,
        certifications TEXT,
        price INTEGER NOT NULL,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        photo_url TEXT,
        location TEXT,
        contact TEXT,
        availability TEXT,
        is_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Create gyms table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS gyms (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        website TEXT,
        price INTEGER NOT NULL,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        photo_url TEXT,
        amenities TEXT,
        hours TEXT,
        distance REAL,
        coordinates TEXT,
        has_pool INTEGER DEFAULT 0,
        has_sauna INTEGER DEFAULT 0,
        has_classes INTEGER DEFAULT 0,
        has_pt INTEGER DEFAULT 0
      )
    `);

    // Create bookings table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        trainer_id TEXT NOT NULL REFERENCES trainers(id),
        date INTEGER NOT NULL,
        duration INTEGER DEFAULT 60,
        status TEXT NOT NULL DEFAULT 'pending',
        price INTEGER,
        notes TEXT,
        rating INTEGER,
        review TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create challenges table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        description TEXT,
        type TEXT,
        goal TEXT,
        target INTEGER,
        start_date INTEGER,
        end_date INTEGER,
        reward TEXT,
        is_active INTEGER DEFAULT 1,
        created_by TEXT REFERENCES users(id)
      )
    `);

    // Create user_challenges table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS user_challenges (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        challenge_id TEXT NOT NULL REFERENCES challenges(id),
        progress INTEGER DEFAULT 0,
        is_completed INTEGER DEFAULT 0,
        joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
        completed_at INTEGER
      )
    `);

    // Create achievements table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        points INTEGER DEFAULT 0,
        is_rare INTEGER DEFAULT 0,
        unlocked_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    console.log('All database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Call initialization
initializeTables();