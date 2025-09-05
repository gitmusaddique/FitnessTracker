import { z } from "zod";

// Admin authentication schema
export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Admin user type
export interface AdminUser {
  id: string;
  username: string;
  role: 'super_admin';
  createdAt: Date;
}

export type AdminLoginData = z.infer<typeof adminLoginSchema>;