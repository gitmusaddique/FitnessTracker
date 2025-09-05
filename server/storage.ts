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
        specialty: "Strength Training",
        bio: "Certified personal trainer with 8+ years of experience in strength training and muscle building.",
        price: 6000, // $60
        rating: 4.9,
        reviewCount: 127,
        photoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        location: "Downtown Fitness",
        contact: "mike.johnson@email.com"
      },
      {
        name: "Sarah Wilson",
        specialty: "Yoga & Flexibility",
        bio: "Certified yoga instructor specializing in flexibility, mindfulness, and stress relief techniques.",
        price: 4500, // $45
        rating: 4.7,
        reviewCount: 89,
        photoUrl: "https://images.unsplash.com/photo-1594824181247-7b5297ae5b89?w=400&h=400&fit=crop",
        location: "Zen Studio",
        contact: "sarah.wilson@email.com"
      }
    ];

    trainersData.forEach(trainer => {
      const id = randomUUID();
      this.trainers.set(id, { ...trainer, id });
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
        amenities: ["Cardio Equipment", "Free Weights", "Group Classes", "Locker Rooms"],
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
        amenities: ["Premium Equipment", "Personal Training", "Swimming Pool", "Sauna", "Juice Bar"],
        hours: "6 AM - 11 PM",
        distance: 2.1
      }
    ];

    gymsData.forEach(gym => {
      const id = randomUUID();
      this.gyms.set(id, { ...gym, id });
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
      createdAt: new Date()
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
      date: new Date()
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
      date: new Date()
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
      createdAt: new Date()
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

export const storage = new MemStorage();
