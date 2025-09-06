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
        photo_url TEXT,
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

    // Create exercises table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        body_part TEXT NOT NULL,
        equipment TEXT,
        difficulty TEXT NOT NULL,
        instructions TEXT,
        tips TEXT,
        video_url TEXT,
        image_url TEXT,
        popularity_score INTEGER DEFAULT 0,
        is_verified INTEGER DEFAULT 0
      )
    `);

    // Create foods table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS foods (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        brand TEXT,
        barcode TEXT,
        serving_size TEXT,
        calories_per_serving INTEGER,
        protein_per_serving REAL,
        carbs_per_serving REAL,
        fat_per_serving REAL,
        fiber_per_serving REAL,
        sugar_per_serving REAL,
        sodium_per_serving REAL,
        category TEXT,
        is_verified INTEGER DEFAULT 0
      )
    `);

    // Create custom meal types table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS custom_meal_types (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create custom workout types table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS custom_workout_types (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create custom intensity levels table
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS custom_intensity_levels (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Seed exercises
    db.run(`
      INSERT OR IGNORE INTO exercises (id, name, category, body_part, equipment, difficulty, instructions)
      VALUES 
        ('ex001', 'Push-ups', 'strength', 'chest', 'bodyweight', 'beginner', 'Start in plank position, lower body to floor, push back up'),
        ('ex002', 'Squats', 'strength', 'legs', 'bodyweight', 'beginner', 'Stand with feet hip-width apart, lower hips back and down, return to standing'),
        ('ex003', 'Pull-ups', 'strength', 'back', 'pull-up bar', 'intermediate', 'Hang from bar, pull body up until chin clears bar'),
        ('ex004', 'Plank', 'strength', 'core', 'bodyweight', 'beginner', 'Hold straight body position on forearms and toes'),
        ('ex005', 'Deadlifts', 'strength', 'full-body', 'barbell', 'intermediate', 'Lift weight from floor to hip level with straight back'),
        ('ex006', 'Bench Press', 'strength', 'chest', 'barbell', 'intermediate', 'Lie on bench, press weight up from chest'),
        ('ex007', 'Running', 'cardio', 'full-body', 'none', 'beginner', 'Maintain steady pace, land on midfoot'),
        ('ex008', 'Cycling', 'cardio', 'legs', 'bicycle', 'beginner', 'Maintain steady cadence and posture'),
        ('ex009', 'Jumping Jacks', 'cardio', 'full-body', 'bodyweight', 'beginner', 'Jump feet apart while raising arms overhead'),
        ('ex010', 'Burpees', 'cardio', 'full-body', 'bodyweight', 'intermediate', 'Squat down, jump back to plank, do push-up, jump forward, jump up'),
        ('ex011', 'Mountain Climbers', 'cardio', 'core', 'bodyweight', 'beginner', 'Start in plank, alternate bringing knees to chest quickly'),
        ('ex012', 'Lunges', 'strength', 'legs', 'bodyweight', 'beginner', 'Step forward, lower hips until both knees bent 90 degrees'),
        ('ex013', 'Bicep Curls', 'strength', 'arms', 'dumbbells', 'beginner', 'Hold weights, curl up to shoulders, lower slowly'),
        ('ex014', 'Shoulder Press', 'strength', 'shoulders', 'dumbbells', 'beginner', 'Press weights from shoulders to overhead'),
        ('ex015', 'Yoga Flow', 'flexibility', 'full-body', 'yoga mat', 'beginner', 'Flow through poses with controlled breathing');
    `);

    // Seed foods
    db.run(`
      INSERT OR IGNORE INTO foods (id, name, serving_size, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, category)
      VALUES 
        ('f001', 'Chicken Breast', '100g', 165, 31, 0, 3.6, 'protein'),
        ('f002', 'Brown Rice', '100g cooked', 111, 2.6, 23, 0.9, 'grain'),
        ('f003', 'Broccoli', '100g', 34, 2.8, 7, 0.4, 'vegetable'),
        ('f004', 'Salmon', '100g', 208, 25, 0, 12, 'protein'),
        ('f005', 'Sweet Potato', '100g', 86, 1.6, 20, 0.1, 'vegetable'),
        ('f006', 'Greek Yogurt', '100g', 59, 10, 3.6, 0.4, 'dairy'),
        ('f007', 'Banana', '1 medium (118g)', 105, 1.3, 27, 0.4, 'fruit'),
        ('f008', 'Oats', '100g dry', 389, 16.9, 66, 6.9, 'grain'),
        ('f009', 'Eggs', '1 large', 78, 6, 0.6, 5, 'protein'),
        ('f010', 'Spinach', '100g', 23, 2.9, 3.6, 0.4, 'vegetable'),
        ('f011', 'Avocado', '100g', 160, 2, 9, 15, 'fruit'),
        ('f012', 'Almonds', '28g (24 nuts)', 164, 6, 6, 14, 'protein'),
        ('f013', 'Tuna', '100g', 144, 30, 0, 1, 'protein'),
        ('f014', 'Quinoa', '100g cooked', 120, 4.4, 22, 1.9, 'grain'),
        ('f015', 'Apple', '1 medium (182g)', 95, 0.5, 25, 0.3, 'fruit'),
        ('f016', 'Pasta', '100g cooked', 131, 5, 25, 1.1, 'grain'),
        ('f017', 'Olive Oil', '1 tbsp (13.5g)', 119, 0, 0, 13.5, 'fat'),
        ('f018', 'Milk', '240ml', 149, 8, 12, 8, 'dairy'),
        ('f019', 'Turkey', '100g', 189, 29, 0, 7, 'protein'),
        ('f020', 'Carrots', '100g', 41, 0.9, 10, 0.2, 'vegetable');
    `);

    console.log('All database tables initialized successfully');
    console.log('Preset exercises and foods loaded');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Call initialization
initializeTables();