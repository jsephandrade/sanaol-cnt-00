import { z } from 'zod';
import { ISODateTime } from './utils';
import { RoleValue } from './role';

export const UserStatus = z.enum(['active', 'deactivated']);

export const UserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    role: RoleValue,
    status: UserStatus,
    permissions: z.array(z.string()).optional().default([]),
    createdAt: ISODateTime,
    lastLogin: ISODateTime,
  })
  .passthrough();

export const UserCreateSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    role: RoleValue.default('staff'),
  })
  .strict();

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: RoleValue.optional(),
    status: UserStatus.optional(),
  })
  .strict();

