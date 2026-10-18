import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string(),
    role: z
      .enum([
        'admin',
        'manager',
        'inventory_manager',
        'cashier',
        'waiter',
        'kitchen',
        'receptionist',
      ])
      .optional()
      .default('inventory_manager'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
