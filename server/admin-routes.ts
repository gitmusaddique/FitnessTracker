import type { Express } from "express";
import jwt from "jsonwebtoken";
import { adminStorage } from "./admin-storage";
import { adminLoginSchema } from "@shared/admin-schema";
import { insertTrainerSchema, insertGymSchema } from "@shared/schema";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-2024";

// Admin authentication middleware
const authenticateAdmin = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin access token required' });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as { adminId: string, role: string };
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const admin = await adminStorage.getAdminByUsername('administrator');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin token' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired admin token' });
  }
};

export async function registerAdminRoutes(app: Express) {
  
  // Admin login
  app.post("/admin/api/auth/login", async (req, res) => {
    try {
      const credentials = adminLoginSchema.parse(req.body);
      
      const admin = await adminStorage.validateAdmin(credentials);
      if (!admin) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const token = jwt.sign(
        { adminId: admin.id, role: admin.role }, 
        ADMIN_JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Dashboard stats
  app.get("/admin/api/stats", authenticateAdmin, async (req, res) => {
    try {
      const stats = await adminStorage.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User management
  app.get("/admin/api/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await adminStorage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/admin/api/users/:id", authenticateAdmin, async (req, res) => {
    try {
      const deleted = await adminStorage.deleteUser(req.params.id);
      if (deleted) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Trainer management
  app.get("/admin/api/trainers", authenticateAdmin, async (req, res) => {
    try {
      const trainers = await adminStorage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      console.error('Get admin trainers error:', error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  app.post("/admin/api/trainers", authenticateAdmin, async (req, res) => {
    try {
      const trainerData = insertTrainerSchema.parse(req.body);
      const trainer = await adminStorage.createTrainer(trainerData);
      res.json(trainer);
    } catch (error) {
      console.error('Create trainer error:', error);
      res.status(400).json({ message: "Invalid trainer data" });
    }
  });

  app.put("/admin/api/trainers/:id", authenticateAdmin, async (req, res) => {
    try {
      const updates = insertTrainerSchema.partial().parse(req.body);
      const trainer = await adminStorage.updateTrainer(req.params.id, updates);
      if (trainer) {
        res.json(trainer);
      } else {
        res.status(404).json({ message: "Trainer not found" });
      }
    } catch (error) {
      console.error('Update trainer error:', error);
      res.status(400).json({ message: "Invalid trainer data" });
    }
  });

  app.delete("/admin/api/trainers/:id", authenticateAdmin, async (req, res) => {
    try {
      const deleted = await adminStorage.deleteTrainer(req.params.id);
      if (deleted) {
        res.json({ message: "Trainer deleted successfully" });
      } else {
        res.status(404).json({ message: "Trainer not found" });
      }
    } catch (error) {
      console.error('Delete trainer error:', error);
      res.status(500).json({ message: "Failed to delete trainer" });
    }
  });

  // Gym management
  app.get("/admin/api/gyms", authenticateAdmin, async (req, res) => {
    try {
      const gyms = await adminStorage.getAllGyms();
      res.json(gyms);
    } catch (error) {
      console.error('Get admin gyms error:', error);
      res.status(500).json({ message: "Failed to fetch gyms" });
    }
  });

  app.post("/admin/api/gyms", authenticateAdmin, async (req, res) => {
    try {
      const gymData = insertGymSchema.parse(req.body);
      const gym = await adminStorage.createGym(gymData);
      res.json(gym);
    } catch (error) {
      console.error('Create gym error:', error);
      res.status(400).json({ message: "Invalid gym data" });
    }
  });

  app.put("/admin/api/gyms/:id", authenticateAdmin, async (req, res) => {
    try {
      const updates = insertGymSchema.partial().parse(req.body);
      const gym = await adminStorage.updateGym(req.params.id, updates);
      if (gym) {
        res.json(gym);
      } else {
        res.status(404).json({ message: "Gym not found" });
      }
    } catch (error) {
      console.error('Update gym error:', error);
      res.status(400).json({ message: "Invalid gym data" });
    }
  });

  app.delete("/admin/api/gyms/:id", authenticateAdmin, async (req, res) => {
    try {
      const deleted = await adminStorage.deleteGym(req.params.id);
      if (deleted) {
        res.json({ message: "Gym deleted successfully" });
      } else {
        res.status(404).json({ message: "Gym not found" });
      }
    } catch (error) {
      console.error('Delete gym error:', error);
      res.status(500).json({ message: "Failed to delete gym" });
    }
  });
}