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

export const ChangePasswordSchema = z.object({
	currentPassword: z.string().nonempty("Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters long"),
	confirmNewPassword: z.string().min(1, "Confirm new password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
	message: "Passwords do not match",
	path: ["confirmNewPassword"],
});

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

export const AccountFormSchema = z.object({
	name: z.string().nonempty("Full Name is required").min(4, "Name must be at least 4 characters long"),
	email: z.string().optional(),
	phone: z.string().optional(),
	title: z.string().optional(),
	role: z.string().optional(),
});

export type AccountFormData = z.infer<typeof AccountFormSchema>;