import { eq, like, desc, and } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import { 
  type User, 
  type InsertUser, 
  type Workout, 
  type InsertWorkout,
  type Meal,
  type InsertMeal,
  type Exercise,
  type Food,
  type Trainer,
  type InsertTrainer,
  type Gym,
  type InsertGym,
  type Booking,
  type InsertBooking,
  type Challenge,
  type InsertChallenge,
  type UserChallenge,
  type Achievement,
  type InsertAchievement
} from "@shared/schema";
import { IStorage } from './storage';

export class SQLiteStorage implements IStorage {
  constructor() {
    this.initializeTables();
    this.seedData();
  }

  private async initializeTables() {
    try {
      // Create tables using drizzle-kit would be better, but for now we'll ensure data exists
      console.log('SQLite tables initialized');
    } catch (error) {
      console.error('Error initializing tables:', error);
    }
  }

  private async seedData() {
    try {
      // Seed trainers if none exist
      const existingTrainers = await db.select().from(schema.trainers).limit(1);
      if (existingTrainers.length === 0) {
        const trainersData: InsertTrainer[] = [
          {
            name: "Mike Johnson",
            email: "mike.johnson@email.com",
            specialty: "Strength Training",
            bio: "Certified personal trainer with 8+ years of experience in strength training and muscle building.",
            price: 6000, // $60
            rating: 4.9,
            reviewCount: 127,
            photoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
            location: "Downtown Fitness",
            contact: "mike.johnson@email.com",
            isVerified: 1,
            isActive: 1
          },
          {
            name: "Sarah Wilson", 
            email: "sarah.wilson@email.com",
            specialty: "Yoga & Flexibility",
            bio: "Certified yoga instructor specializing in flexibility, mindfulness, and stress relief techniques.",
            price: 4500, // $45
            rating: 4.7,
            reviewCount: 89,
            photoUrl: "https://images.unsplash.com/photo-1594824181247-7b5297ae5b89?w=400&h=400&fit=crop",
            location: "Zen Studio",
            contact: "sarah.wilson@email.com",
            isVerified: 1,
            isActive: 1
          }
        ];

        await db.insert(schema.trainers).values(trainersData);
      }

      // Seed gyms if none exist
      const existingGyms = await db.select().from(schema.gyms).limit(1);
      if (existingGyms.length === 0) {
        const gymsData: InsertGym[] = [
          {
            name: "FitZone Downtown",
            location: "Downtown",
            address: "123 Main Street",
            price: 4900, // $49
            rating: 4.8,
            reviewCount: 342,
            photoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop",
            amenities: JSON.stringify(["Cardio Equipment", "Free Weights", "Group Classes", "Locker Rooms"]),
            hours: "Open 24/7",
            distance: 1.2
          },
          {
            name: "Elite Fitness Club",
            location: "Oak Avenue", 
            address: "456 Oak Avenue",
            price: 8900, // $89
            rating: 4.6,
            reviewCount: 198,
            photoUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=300&fit=crop",
            amenities: JSON.stringify(["Premium Equipment", "Personal Training", "Swimming Pool", "Sauna", "Juice Bar"]),
            hours: "6 AM - 11 PM",
            distance: 2.1
          }
        ];

        await db.insert(schema.gyms).values(gymsData);
      }

      console.log('SQLite seed data initialized');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(schema.users).values(insertUser).returning();
    return results[0];
  }

  // Workout methods
  async getUserWorkouts(userId: string): Promise<Workout[]> {
    return await db.select()
      .from(schema.workouts)
      .where(eq(schema.workouts.userId, userId))
      .orderBy(desc(schema.workouts.date));
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const results = await db.insert(schema.workouts).values(insertWorkout).returning();
    return results[0];
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const results = await db.select().from(schema.workouts).where(eq(schema.workouts.id, id)).limit(1);
    return results[0];
  }

  async deleteWorkout(id: string): Promise<boolean> {
    const result = await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
    return result.changes > 0;
  }

  // Meal methods
  async getUserMeals(userId: string): Promise<Meal[]> {
    return await db.select()
      .from(schema.meals)
      .where(eq(schema.meals.userId, userId))
      .orderBy(desc(schema.meals.date));
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const results = await db.insert(schema.meals).values(insertMeal).returning();
    return results[0];
  }

  async getMeal(id: string): Promise<Meal | undefined> {
    const results = await db.select().from(schema.meals).where(eq(schema.meals.id, id)).limit(1);
    return results[0];
  }

  async deleteMeal(id: string): Promise<boolean> {
    const result = await db.delete(schema.meals).where(eq(schema.meals.id, id));
    return result.changes > 0;
  }

  // Trainer methods
  async getAllTrainers(): Promise<Trainer[]> {
    return await db.select().from(schema.trainers);
  }

  async getTrainer(id: string): Promise<Trainer | undefined> {
    const results = await db.select().from(schema.trainers).where(eq(schema.trainers.id, id)).limit(1);
    return results[0];
  }

  async searchTrainers(query: string): Promise<Trainer[]> {
    return await db.select()
      .from(schema.trainers)
      .where(
        like(schema.trainers.name, `%${query}%`)
      );
  }

  // Gym methods
  async getAllGyms(): Promise<Gym[]> {
    return await db.select().from(schema.gyms);
  }

  async getGym(id: string): Promise<Gym | undefined> {
    const results = await db.select().from(schema.gyms).where(eq(schema.gyms.id, id)).limit(1);
    return results[0];
  }

  async searchGyms(query: string): Promise<Gym[]> {
    return await db.select()
      .from(schema.gyms)
      .where(
        like(schema.gyms.name, `%${query}%`)
      );
  }

  // Booking methods
  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.date));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const results = await db.insert(schema.bookings).values(insertBooking).returning();
    return results[0];
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const results = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
    return results[0];
  }

  async cancelBooking(id: string): Promise<boolean> {
    const result = await db.update(schema.bookings)
      .set({ status: 'cancelled' })
      .where(eq(schema.bookings.id, id));
    return result.changes > 0;
  }

  // Challenge methods
  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(schema.challenges);
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return await db.select()
      .from(schema.challenges)
      .where(eq(schema.challenges.isActive, 1));
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const results = await db.insert(schema.challenges).values(insertChallenge).returning();
    return results[0];
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    return await db.select()
      .from(schema.userChallenges)
      .where(eq(schema.userChallenges.userId, userId));
  }

  async joinChallenge(insertUserChallenge: Omit<UserChallenge, 'id' | 'joinedAt' | 'completedAt'>): Promise<UserChallenge> {
    const results = await db.insert(schema.userChallenges).values(insertUserChallenge).returning();
    return results[0];
  }

  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<boolean> {
    const challenge = await db.select().from(schema.challenges).where(eq(schema.challenges.id, challengeId)).limit(1);
    const isCompleted = challenge[0] && progress >= (challenge[0].target ?? 0) ? 1 : 0;
    
    const result = await db.update(schema.userChallenges)
      .set({ 
        progress, 
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      })
      .where(
        and(
          eq(schema.userChallenges.userId, userId),
          eq(schema.userChallenges.challengeId, challengeId)
        )
      );
    return result.changes > 0;
  }

  // Achievement methods
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db.select()
      .from(schema.achievements)
      .where(eq(schema.achievements.userId, userId))
      .orderBy(desc(schema.achievements.unlockedAt));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const results = await db.insert(schema.achievements).values(insertAchievement).returning();
    return results[0];
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    
    // Get user data
    const userWorkouts = await this.getUserWorkouts(userId);
    const userMeals = await this.getUserMeals(userId);
    
    // Check for first workout achievement
    if (userWorkouts.length >= 1) {
      const existing = await db.select().from(schema.achievements)
        .where(and(
          eq(schema.achievements.userId, userId),
          eq(schema.achievements.type, "first_workout")
        ))
        .limit(1);
      
      if (existing.length === 0) {
        const achievement = await this.createAchievement({
          userId,
          type: "first_workout",
          title: "First Steps",
          description: "Completed your first workout!",
          icon: "🎯",
          points: 10
        });
        newAchievements.push(achievement);
      }
    }

    // Check for workout warrior achievement
    if (userWorkouts.length >= 10) {
      const existing = await db.select().from(schema.achievements)
        .where(and(
          eq(schema.achievements.userId, userId),
          eq(schema.achievements.type, "workout_warrior")
        ))
        .limit(1);
      
      if (existing.length === 0) {
        const achievement = await this.createAchievement({
          userId,
          type: "workout_warrior", 
          title: "Workout Warrior",
          description: "Completed 10 workouts!",
          icon: "💪",
          points: 50
        });
        newAchievements.push(achievement);
      }
    }

    // Check for nutrition tracker achievement
    if (userMeals.length >= 1) {
      const existing = await db.select().from(schema.achievements)
        .where(and(
          eq(schema.achievements.userId, userId),
          eq(schema.achievements.type, "nutrition_start")
        ))
        .limit(1);
      
      if (existing.length === 0) {
        const achievement = await this.createAchievement({
          userId,
          type: "nutrition_start",
          title: "Nutrition Tracker", 
          description: "Logged your first meal!",
          icon: "🥗",
          points: 10
        });
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  // Exercise methods
  async getAllExercises(): Promise<Exercise[]> {
    return await db.select().from(schema.exercises).orderBy(schema.exercises.popularityScore);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const results = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id)).limit(1);
    return results[0];
  }

  // Food methods
  async getAllFoods(): Promise<Food[]> {
    return await db.select().from(schema.foods).orderBy(schema.foods.name);
  }

  async getFood(id: string): Promise<Food | undefined> {
    const results = await db.select().from(schema.foods).where(eq(schema.foods.id, id)).limit(1);
    return results[0];
  }
}