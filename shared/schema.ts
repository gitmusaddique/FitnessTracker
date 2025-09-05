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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  duration: integer("duration").notNull(), // minutes
  calories: integer("calories"),
  distance: real("distance"), // km
  notes: text("notes"),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const meals = sqliteTable("meals", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  calories: integer("calories").notNull(),
  notes: text("notes"),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const trainers = sqliteTable("trainers", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  price: integer("price").notNull(), // price per hour in cents
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  photoUrl: text("photo_url"),
  location: text("location"),
  contact: text("contact"),
});

export const gyms = sqliteTable("gyms", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  price: integer("price").notNull(), // monthly price in cents
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  photoUrl: text("photo_url"),
  amenities: text("amenities"),
  hours: text("hours"),
  distance: real("distance"), // km from user
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  trainerId: text("trainer_id").notNull().references(() => trainers.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  notes: text("notes"),
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
export type Trainer = typeof trainers.$inferSelect;
export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type Gym = typeof gyms.$inferSelect;
export type InsertGym = z.infer<typeof insertGymSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type LoginData = z.infer<typeof loginSchema>;
