import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  age: integer("age"),
  height: real("height"), // cm
  weight: real("weight"), // kg
  gender: text("gender"), // male, female, other
  activityLevel: text("activity_level"), // sedentary, light, moderate, active, very_active
  fitnessGoal: text("fitness_goal"), // lose_weight, gain_muscle, maintain, improve_endurance
  targetWeight: real("target_weight"), // kg
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
  workoutStreak: integer("workout_streak").default(0),
  totalWorkouts: integer("total_workouts").default(0),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  isVerified: integer("is_verified").default(0), // 0 = false, 1 = true
  isPremium: integer("is_premium").default(0), // 0 = false, 1 = true
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // strength, cardio, yoga, sports, hiit, flexibility
  category: text("category"), // upper, lower, full-body, push, pull, core
  duration: integer("duration").notNull(), // minutes
  calories: integer("calories"),
  distance: real("distance"), // km
  intensity: text("intensity"), // low, moderate, high
  exercises: text("exercises"), // JSON array of exercises
  personalRecord: integer("personal_record").default(0), // 0 = false, 1 = true
  notes: text("notes"),
  mood: text("mood"), // great, good, okay, tired
  difficulty: integer("difficulty"), // 1-10 scale
  muscleGroups: text("muscle_groups"), // JSON array
  equipment: text("equipment"), // JSON array
  location: text("location"), // gym, home, outdoor
  visibility: text("visibility").default('private'), // public, private, friends
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  category: text("category").notNull(), // strength, cardio, flexibility, balance
  bodyPart: text("body_part").notNull(), // chest, back, legs, arms, shoulders, core, full-body
  equipment: text("equipment"), // dumbbells, barbell, bodyweight, machine, etc
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  instructions: text("instructions"),
  tips: text("tips"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  popularityScore: integer("popularity_score").default(0),
  isVerified: integer("is_verified").default(0), // 0 = false, 1 = true
});

export const workoutExercises = sqliteTable("workout_exercises", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  workoutId: text("workout_id").notNull().references(() => workouts.id),
  exerciseId: text("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets").notNull(),
  reps: integer("reps"),
  weight: real("weight"), // kg
  duration: integer("duration"), // seconds for time-based exercises
  distance: real("distance"), // meters for distance-based exercises
  restTime: integer("rest_time"), // seconds
  notes: text("notes"),
  orderIndex: integer("order_index").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const meals = sqliteTable("meals", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  photoUrl: text("photo_url"),
  calories: integer("calories").notNull(),
  protein: real("protein"), // grams
  carbs: real("carbs"), // grams
  fat: real("fat"), // grams
  fiber: real("fiber"), // grams
  sugar: real("sugar"), // grams
  sodium: real("sodium"), // mg
  foods: text("foods"), // JSON array of food items
  notes: text("notes"),
  rating: integer("rating"), // 1-5 scale
  visibility: text("visibility").default('private'),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const foods = sqliteTable("foods", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  brand: text("brand"),
  barcode: text("barcode"),
  servingSize: text("serving_size"),
  caloriesPerServing: integer("calories_per_serving"),
  proteinPerServing: real("protein_per_serving"),
  carbsPerServing: real("carbs_per_serving"),
  fatPerServing: real("fat_per_serving"),
  fiberPerServing: real("fiber_per_serving"),
  sugarPerServing: real("sugar_per_serving"),
  sodiumPerServing: real("sodium_per_serving"),
  category: text("category"), // protein, vegetable, fruit, grain, dairy, etc
  isVerified: integer("is_verified").default(0), // 0 = false, 1 = true
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // workout_streak, weight_loss, pr, total_workouts, etc
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  points: integer("points").default(0),
  isRare: integer("is_rare").default(0), // 0 = false, 1 = true
  unlockedAt: integer("unlocked_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const bodyMeasurements = sqliteTable("body_measurements", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  weight: real("weight"), // kg
  bodyFat: real("body_fat"), // percentage
  muscleMass: real("muscle_mass"), // kg
  chest: real("chest"), // cm
  waist: real("waist"), // cm
  hips: real("hips"), // cm
  biceps: real("biceps"), // cm
  thighs: real("thighs"), // cm
  neck: real("neck"), // cm
  notes: text("notes"),
  photoUrl: text("photo_url"),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const workoutPlans = sqliteTable("workout_plans", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration"), // weeks
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  goal: text("goal"), // weight_loss, muscle_gain, endurance, strength
  workoutsPerWeek: integer("workouts_per_week"),
  creatorId: text("creator_id").references(() => users.id),
  isPublic: integer("is_public").default(0), // 0 = false, 1 = true
  popularityScore: integer("popularity_score").default(0),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const challenges = sqliteTable("challenges", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type"), // daily, weekly, monthly, custom
  goal: text("goal"), // steps, workouts, calories, distance
  target: integer("target"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  reward: text("reward"),
  isActive: integer("is_active").default(1), // 0 = false, 1 = true
  createdBy: text("created_by").references(() => users.id),
});

export const userChallenges = sqliteTable("user_challenges", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  challengeId: text("challenge_id").notNull().references(() => challenges.id),
  progress: integer("progress").default(0),
  isCompleted: integer("is_completed").default(0), // 0 = false, 1 = true
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const trainers = sqliteTable("trainers", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  experience: integer("experience"), // years
  certifications: text("certifications"), // JSON array
  price: integer("price").notNull(), // cents
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  photoUrl: text("photo_url"),
  location: text("location"),
  contact: text("contact"),
  availability: text("availability"), // JSON schedule
  isVerified: integer("is_verified").default(0), // 0 = false, 1 = true
  isActive: integer("is_active").default(1), // 0 = false, 1 = true
});

export const gyms = sqliteTable("gyms", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  price: integer("price").notNull(), // cents
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  photoUrl: text("photo_url"),
  amenities: text("amenities"), // JSON array
  hours: text("hours"), // JSON schedule
  distance: real("distance"), // km from user
  coordinates: text("coordinates"), // lat,lng
  hasPool: integer("has_pool").default(0), // 0 = false, 1 = true
  hasSauna: integer("has_sauna").default(0), // 0 = false, 1 = true
  hasClasses: integer("has_classes").default(0), // 0 = false, 1 = true
  hasPT: integer("has_pt").default(0), // 0 = false, 1 = true
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  trainerId: text("trainer_id").notNull().references(() => trainers.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  duration: integer("duration").default(60), // minutes
  status: text("status").notNull().default('pending'), // pending, confirmed, cancelled, completed
  price: integer("price"), // cents
  notes: text("notes"),
  rating: integer("rating"), // 1-5 after completion
  review: text("review"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const socialPosts = sqliteTable("social_posts", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // workout, achievement, progress, photo
  content: text("content"),
  mediaUrl: text("media_url"),
  workoutId: text("workout_id").references(() => workouts.id),
  achievementId: text("achievement_id").references(() => achievements.id),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  visibility: text("visibility").default('public'), // public, friends, private
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const follows = sqliteTable("follows", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  followerId: text("follower_id").notNull().references(() => users.id),
  followingId: text("following_id").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  date: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  date: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurements).omit({
  id: true,
  date: true,
});

export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
});

export const insertGymSchema = createInsertSchema(gyms).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;
export type Trainer = typeof trainers.$inferSelect;
export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type Gym = typeof gyms.$inferSelect;
export type InsertGym = z.infer<typeof insertGymSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type Food = typeof foods.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;