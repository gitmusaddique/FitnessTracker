import { 
  type User, 
  type InsertUser, 
  type Workout, 
  type InsertWorkout,
  type Meal,
  type InsertMeal,
  type Trainer,
  type InsertTrainer,
  type Gym,
  type InsertGym,
  type Booking,
  type InsertBooking
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workout methods
  getUserWorkouts(userId: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkout(id: string): Promise<Workout | undefined>;
  deleteWorkout(id: string): Promise<boolean>;
  
  // Meal methods
  getUserMeals(userId: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  getMeal(id: string): Promise<Meal | undefined>;
  deleteMeal(id: string): Promise<boolean>;
  
  // Trainer methods
  getAllTrainers(): Promise<Trainer[]>;
  getTrainer(id: string): Promise<Trainer | undefined>;
  searchTrainers(query: string): Promise<Trainer[]>;
  
  // Gym methods
  getAllGyms(): Promise<Gym[]>;
  getGym(id: string): Promise<Gym | undefined>;
  searchGyms(query: string): Promise<Gym[]>;
  
  // Booking methods
  getUserBookings(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  cancelBooking(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workouts: Map<string, Workout>;
  private meals: Map<string, Meal>;
  private trainers: Map<string, Trainer>;
  private gyms: Map<string, Gym>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.meals = new Map();
    this.trainers = new Map();
    this.gyms = new Map();
    this.bookings = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed trainers
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
        experience: 8,
        certifications: "NASM, ACE",
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
        experience: 5,
        certifications: "RYT-500, Yin Yoga",
        isActive: 1
      }
    ];

    trainersData.forEach(trainer => {
      const id = randomUUID();
      this.trainers.set(id, { 
        ...trainer, 
        id,
        bio: trainer.bio ?? null,
        experience: trainer.experience ?? null,
        certifications: trainer.certifications ?? null,
        rating: trainer.rating ?? null,
        reviewCount: trainer.reviewCount ?? null,
        photoUrl: trainer.photoUrl ?? null,
        location: trainer.location ?? null,
        contact: trainer.contact ?? null,
        availability: trainer.availability ?? null,
        isVerified: trainer.isVerified ?? null,
        isActive: trainer.isActive ?? null
      });
    });

    // Seed gyms
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
        distance: 1.2,
        email: "info@fitzone.com",
        phone: "+1234567890",
        website: "https://fitzone.com"
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
        distance: 2.1,
        email: "contact@elitefit.com",
        phone: "+1234567891",
        website: "https://elitefit.com"
      }
    ];

    gymsData.forEach(gym => {
      const id = randomUUID();
      this.gyms.set(id, { 
        ...gym, 
        id,
        email: gym.email ?? null,
        phone: gym.phone ?? null,
        website: gym.website ?? null,
        rating: gym.rating ?? null,
        reviewCount: gym.reviewCount ?? null,
        photoUrl: gym.photoUrl ?? null,
        amenities: gym.amenities,
        hours: gym.hours,
        coordinates: gym.coordinates ?? null,
        hasPool: gym.hasPool ?? 0,
        hasSauna: gym.hasSauna ?? 0,
        hasClasses: gym.hasClasses ?? 0,
        hasPT: gym.hasPT ?? 0
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      height: insertUser.height ?? null,
      avatar: insertUser.avatar ?? null,
      age: insertUser.age ?? null,
      weight: insertUser.weight ?? null,
      gender: insertUser.gender ?? null,
      activityLevel: insertUser.activityLevel ?? null,
      fitnessGoal: insertUser.fitnessGoal ?? null,
      targetWeight: insertUser.targetWeight ?? null,
      dailyCalorieGoal: insertUser.dailyCalorieGoal ?? 2000,
      workoutStreak: insertUser.workoutStreak ?? 0,
      totalWorkouts: insertUser.totalWorkouts ?? 0,
      level: insertUser.level ?? 1,
      xp: insertUser.xp ?? 0,
      isVerified: insertUser.isVerified ?? 0,
      isPremium: insertUser.isPremium ?? 0
    };
    this.users.set(id, user);
    return user;
  }

  // Workout methods
  async getUserWorkouts(userId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = {
      ...insertWorkout,
      id,
      date: new Date(),
      visibility: insertWorkout.visibility ?? null,
      location: insertWorkout.location ?? null,
      distance: insertWorkout.distance ?? null,
      category: insertWorkout.category ?? null,
      calories: insertWorkout.calories ?? null,
      intensity: insertWorkout.intensity ?? null,
      exercises: insertWorkout.exercises ?? null,
      personalRecord: insertWorkout.personalRecord ?? 0,
      notes: insertWorkout.notes ?? null,
      mood: insertWorkout.mood ?? null,
      difficulty: insertWorkout.difficulty ?? null,
      muscleGroups: insertWorkout.muscleGroups ?? null,
      equipment: insertWorkout.equipment ?? null
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async deleteWorkout(id: string): Promise<boolean> {
    return this.workouts.delete(id);
  }

  // Meal methods
  async getUserMeals(userId: string): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter(meal => meal.userId === userId)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = randomUUID();
    const meal: Meal = {
      ...insertMeal,
      id,
      date: new Date(),
      visibility: insertMeal.visibility ?? null,
      rating: insertMeal.rating ?? null,
      photoUrl: insertMeal.photoUrl ?? null,
      notes: insertMeal.notes ?? null,
      protein: insertMeal.protein ?? null,
      carbs: insertMeal.carbs ?? null,
      fat: insertMeal.fat ?? null,
      fiber: insertMeal.fiber ?? null,
      sugar: insertMeal.sugar ?? null,
      sodium: insertMeal.sodium ?? null,
      foods: insertMeal.foods ?? null
    };
    this.meals.set(id, meal);
    return meal;
  }

  async getMeal(id: string): Promise<Meal | undefined> {
    return this.meals.get(id);
  }

  async deleteMeal(id: string): Promise<boolean> {
    return this.meals.delete(id);
  }

  // Trainer methods
  async getAllTrainers(): Promise<Trainer[]> {
    return Array.from(this.trainers.values());
  }

  async getTrainer(id: string): Promise<Trainer | undefined> {
    return this.trainers.get(id);
  }

  async searchTrainers(query: string): Promise<Trainer[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.trainers.values()).filter(trainer =>
      trainer.name.toLowerCase().includes(lowerQuery) ||
      trainer.specialty.toLowerCase().includes(lowerQuery) ||
      trainer.location?.toLowerCase().includes(lowerQuery)
    );
  }

  // Gym methods
  async getAllGyms(): Promise<Gym[]> {
    return Array.from(this.gyms.values());
  }

  async getGym(id: string): Promise<Gym | undefined> {
    return this.gyms.get(id);
  }

  async searchGyms(query: string): Promise<Gym[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.gyms.values()).filter(gym =>
      gym.name.toLowerCase().includes(lowerQuery) ||
      gym.location.toLowerCase().includes(lowerQuery) ||
      gym.address.toLowerCase().includes(lowerQuery)
    );
  }

  // Booking methods
  async getUserBookings(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
      duration: insertBooking.duration ?? null,
      status: insertBooking.status ?? "pending",
      price: insertBooking.price ?? null,
      rating: insertBooking.rating ?? null,
      notes: insertBooking.notes ?? null,
      review: insertBooking.review ?? null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async cancelBooking(id: string): Promise<boolean> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = "cancelled";
      return true;
    }
    return false;
  }
}

// import { SQLiteStorage } from './sqlite-storage';

export const storage = new MemStorage();
