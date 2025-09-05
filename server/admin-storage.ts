import bcrypt from "bcryptjs";
import { adminDb } from './admin-db';
import { storage } from './storage';
import type { AdminUser, AdminLoginData } from '@shared/admin-schema';
import type { Trainer, InsertTrainer, Gym, InsertGym, User } from '@shared/schema';

export class AdminStorage {
  constructor() {
    this.initializeSuperAdmin();
  }

  private async initializeSuperAdmin() {
    try {
      // Check if super admin exists
      const existingAdmin = await this.getAdminByUsername('administrator');
      if (!existingAdmin) {
        // Create super admin with specified credentials
        const hashedPassword = await bcrypt.hash('785685@aA', 10);
        adminDb.prepare(`
          INSERT INTO admin_users (username, password, role)
          VALUES (?, ?, ?)
        `).run('administrator', hashedPassword, 'super_admin');
        
        console.log('Super admin created successfully');
      }
    } catch (error) {
      console.error('Error initializing super admin:', error);
    }
  }

  async getAdminByUsername(username: string): Promise<AdminUser | null> {
    try {
      const result = adminDb.prepare(`
        SELECT id, username, role, created_at as createdAt
        FROM admin_users WHERE username = ?
      `).get(username) as any;
      
      if (result) {
        return {
          ...result,
          createdAt: new Date(result.createdAt * 1000)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting admin:', error);
      return null;
    }
  }

  async validateAdmin(credentials: AdminLoginData): Promise<AdminUser | null> {
    try {
      const admin = adminDb.prepare(`
        SELECT id, username, password, role, created_at as createdAt
        FROM admin_users WHERE username = ?
      `).get(credentials.username) as any;

      if (admin) {
        const validPassword = await bcrypt.compare(credentials.password, admin.password);
        if (validPassword) {
          return {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            createdAt: new Date(admin.createdAt * 1000)
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error validating admin:', error);
      return null;
    }
  }

  // User management
  async getAllUsers(): Promise<User[]> {
    return Array.from((storage as any).users.values());
  }

  async deleteUser(userId: string): Promise<boolean> {
    return (storage as any).users.delete(userId);
  }

  // Trainer management
  async getAllTrainers(): Promise<Trainer[]> {
    return await storage.getAllTrainers();
  }

  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const id = crypto.randomUUID();
    const newTrainer: Trainer = { ...trainer, id };
    (storage as any).trainers.set(id, newTrainer);
    return newTrainer;
  }

  async updateTrainer(id: string, updates: Partial<InsertTrainer>): Promise<Trainer | null> {
    const trainer = (storage as any).trainers.get(id);
    if (trainer) {
      const updated = { ...trainer, ...updates };
      (storage as any).trainers.set(id, updated);
      return updated;
    }
    return null;
  }

  async deleteTrainer(id: string): Promise<boolean> {
    return (storage as any).trainers.delete(id);
  }

  // Gym management
  async getAllGyms(): Promise<Gym[]> {
    return await storage.getAllGyms();
  }

  async createGym(gym: InsertGym): Promise<Gym> {
    const id = crypto.randomUUID();
    const newGym: Gym = { ...gym, id };
    (storage as any).gyms.set(id, newGym);
    return newGym;
  }

  async updateGym(id: string, updates: Partial<InsertGym>): Promise<Gym | null> {
    const gym = (storage as any).gyms.get(id);
    if (gym) {
      const updated = { ...gym, ...updates };
      (storage as any).gyms.set(id, updated);
      return updated;
    }
    return null;
  }

  async deleteGym(id: string): Promise<boolean> {
    return (storage as any).gyms.delete(id);
  }

  // Analytics
  async getStats() {
    const users = await this.getAllUsers();
    const trainers = await this.getAllTrainers();
    const gyms = await this.getAllGyms();
    
    return {
      totalUsers: users.length,
      totalTrainers: trainers.length,
      totalGyms: gyms.length,
      recentUsers: users.slice(-5),
      activeBookings: Array.from((storage as any).bookings.values()).length
    };
  }
}

export const adminStorage = new AdminStorage();