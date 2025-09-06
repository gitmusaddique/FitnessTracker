import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { upload, processImage, getFileUrl } from "./upload-utils";
import { 
  insertUserSchema, 
  loginSchema, 
  insertWorkoutSchema,
  insertMealSchema,
  insertBookingSchema,
  insertChallengeSchema,
  insertAchievementSchema
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";


// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    });
  });

  // Workout routes
  app.get("/api/workouts", authenticateToken, async (req: any, res) => {
    try {
      const workouts = await storage.getUserWorkouts(req.user.id);
      res.json(workouts);
    } catch (error) {
      console.error('Get workouts error:', error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.post("/api/workouts", authenticateToken, upload.single('photo'), async (req: any, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        userId: req.user.id,
        duration: parseInt(req.body.duration),
        calories: req.body.calories ? parseInt(req.body.calories) : undefined,
        distance: req.body.distance ? parseFloat(req.body.distance) : undefined,
        personalRecord: req.body.personalRecord ? 1 : 0
      });
      
      // Handle photo upload
      if (req.file) {
        const processedPath = await processImage(req.file.path, { width: 600, height: 400 });
        workoutData.photoUrl = getFileUrl(processedPath);
      }
      
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error) {
      console.error('Create workout error:', error);
      res.status(400).json({ message: "Invalid workout data" });
    }
  });

  app.delete("/api/workouts/:id", authenticateToken, async (req: any, res) => {
    try {
      const workout = await storage.getWorkout(req.params.id);
      if (!workout || workout.userId !== req.user.id) {
        return res.status(404).json({ message: "Workout not found" });
      }

      const deleted = await storage.deleteWorkout(req.params.id);
      if (deleted) {
        res.json({ message: "Workout deleted" });
      } else {
        res.status(500).json({ message: "Failed to delete workout" });
      }
    } catch (error) {
      console.error('Delete workout error:', error);
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Meal routes
  app.get("/api/meals", authenticateToken, async (req: any, res) => {
    try {
      const meals = await storage.getUserMeals(req.user.id);
      res.json(meals);
    } catch (error) {
      console.error('Get meals error:', error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  app.post("/api/meals", authenticateToken, upload.single('photo'), async (req: any, res) => {
    try {
      const mealData = insertMealSchema.parse({
        ...req.body,
        userId: req.user.id,
        calories: parseInt(req.body.calories)
      });
      
      // Handle photo upload
      if (req.file) {
        const processedPath = await processImage(req.file.path, { width: 600, height: 400 });
        mealData.photoUrl = getFileUrl(processedPath);
      }
      
      const meal = await storage.createMeal(mealData);
      res.json(meal);
    } catch (error) {
      console.error('Create meal error:', error);
      res.status(400).json({ message: "Invalid meal data" });
    }
  });

  app.delete("/api/meals/:id", authenticateToken, async (req: any, res) => {
    try {
      const meal = await storage.getMeal(req.params.id);
      if (!meal || meal.userId !== req.user.id) {
        return res.status(404).json({ message: "Meal not found" });
      }

      const deleted = await storage.deleteMeal(req.params.id);
      if (deleted) {
        res.json({ message: "Meal deleted" });
      } else {
        res.status(500).json({ message: "Failed to delete meal" });
      }
    } catch (error) {
      console.error('Delete meal error:', error);
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Trainer routes
  app.get("/api/trainers", async (req, res) => {
    try {
      const query = req.query.search as string;
      const trainers = query 
        ? await storage.searchTrainers(query)
        : await storage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error('Get trainers error:', error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  app.get("/api/trainers/:id", async (req, res) => {
    try {
      const trainer = await storage.getTrainer(req.params.id);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json(trainer);
    } catch (error) {
      console.error('Get trainer error:', error);
      res.status(500).json({ message: "Failed to fetch trainer" });
    }
  });

  // Gym routes
  app.get("/api/gyms", async (req, res) => {
    try {
      const query = req.query.search as string;
      const gyms = query
        ? await storage.searchGyms(query)
        : await storage.getAllGyms();
      res.json(gyms);
    } catch (error) {
      console.error('Get gyms error:', error);
      res.status(500).json({ message: "Failed to fetch gyms" });
    }
  });

  app.get("/api/gyms/:id", async (req, res) => {
    try {
      const gym = await storage.getGym(req.params.id);
      if (!gym) {
        return res.status(404).json({ message: "Gym not found" });
      }
      res.json(gym);
    } catch (error) {
      console.error('Get gym error:', error);
      res.status(500).json({ message: "Failed to fetch gym" });
    }
  });

  // Booking routes
  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
        date: new Date(req.body.date)
      });
      
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.patch("/api/bookings/:id/cancel", authenticateToken, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking || booking.userId !== req.user.id) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const cancelled = await storage.cancelBooking(req.params.id);
      if (cancelled) {
        res.json({ message: "Booking cancelled" });
      } else {
        res.status(500).json({ message: "Failed to cancel booking" });
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/user", authenticateToken, async (req: any, res) => {
    try {
      const userChallenges = await storage.getUserChallenges(req.user.id);
      res.json(userChallenges);
    } catch (error) {
      console.error('Get user challenges error:', error);
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  app.post("/api/challenges/join", authenticateToken, async (req: any, res) => {
    try {
      const userChallenge = await storage.joinChallenge({
        userId: req.user.id,
        challengeId: req.body.challengeId,
        progress: 0,
        isCompleted: 0
      });
      res.json(userChallenge);
    } catch (error) {
      console.error('Join challenge error:', error);
      res.status(400).json({ message: "Failed to join challenge" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", authenticateToken, async (req: any, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements/check", authenticateToken, async (req: any, res) => {
    try {
      const newAchievements = await storage.checkAndUnlockAchievements(req.user.id);
      res.json(newAchievements);
    } catch (error) {
      console.error('Check achievements error:', error);
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
