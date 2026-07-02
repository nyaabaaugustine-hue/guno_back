import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, 'Name is required')
    .max(255, 'Name is too long'),
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email is too long'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  firmName: z
    .string({ required_error: 'Firm name is required' })
    .min(1, 'Firm name is required')
    .max(255, 'Firm name is too long'),
})

export const createClientSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .max(255, 'First name is too long'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(255, 'Last name is too long'),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(50, 'Phone is too long')
    .optional()
    .or(z.literal('')),
  ssn: z
    .string()
    .max(11, 'Invalid SSN')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .optional()
    .or(z.literal('')),
})

export const signinSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type SigninInput = z.infer<typeof signinSchema>
