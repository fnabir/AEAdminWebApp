import { z } from 'zod';

export const LoginFormSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export const ForgotPasswordSchema = z.object({
	email: z.string().email({ message: 'Invalid email address' }),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;