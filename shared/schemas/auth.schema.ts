import { z } from 'zod';

/**
 * User Role Enum for Workspace Role-Based Access Control (RBAC)
 */
export const UserRoleEnum = z.enum(['OWNER', 'MEMBER', 'VIEWER']);
export type UserRole = z.infer<typeof UserRoleEnum>;

/**
 * User Profile Domain Schema (sanitized user object without password hash)
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: UserRoleEnum,
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  createdAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Register Input Payload Schema (POST /api/auth/register)
 */
export const RegisterInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

/**
 * Login Input Payload Schema (POST /api/auth/login)
 */
export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Auth Response Schema returned upon successful registration or login
 */
export const AuthResponseSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  user: UserProfileSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * JWT Token Payload Schema decoded from Bearer tokens
 */
export const JwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  role: UserRoleEnum,
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
