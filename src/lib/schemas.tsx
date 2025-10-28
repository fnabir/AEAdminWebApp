import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty('Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long'),
    confirmNewPassword: z.string().min(1, 'Confirm new password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

export const AccountFormSchema = z.object({
  name: z
    .string()
    .nonempty('Full Name is required')
    .min(4, 'Name must be at least 4 characters long'),
  phone: z.string().optional(),
  role: z.string().optional(),
});

export type AccountFormData = z.infer<typeof AccountFormSchema>;

export const FileInfoFormSchema = z.object({
  importer: z
    .string()
    .nonempty('Importer Name is required')
    .refine((val) => val != 'Select', { message: 'Choose Importer' }),
  itemPackage: z.string().nonempty('Package Details is required'),
  itemName: z.string().nonempty('Item Name is required'),
  lc: z.number().optional(),
  be: z.number().optional(),
  bl: z.string().optional(),
  status: z.string().optional(),
});

export type FileInfoFormData = z.infer<typeof FileInfoFormSchema>;

export const FileDetailsFormSchema = z.object({
  importer: z
    .string()
    .nonempty('Importer Name is required')
    .refine((val) => val != 'Select', { message: 'Choose Importer' }),
  itemCount: z.string().nonempty('Item Count is required'),
  itemPackage: z.string().nonempty('Package Details is required'),
  itemName: z.string().nonempty('Item Name is required'),
  lc: z.number().optional(),
  vessel: z.string().optional(),
  rotNo: z.string().optional(),
  bl: z.string().optional(),
  cnfValue: z
    .number()
    .nonnegative('Amount must be positive')
    .refine((val) => !isNaN(val), {
      message: 'Input cannot be empty or not a number',
    })
    .optional(),
  assessableValue: z
    .number()
    .nonnegative('Amount must be positive')
    .refine((val) => !isNaN(val), {
      message: 'Input cannot be empty or not a number',
    })
    .optional(),
  be: z.number().optional(),
  beDate: z.string().optional(),
  assessmentDate: z.string().optional(),
  dutyPaymentDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  dutyPaid: z.string().optional(),
  dutyValue: z
    .number()
    .nonnegative('Amount must be positive')
    .refine((val) => !isNaN(val), {
      message: 'Input cannot be empty or not a number',
    })
    .optional(),
  assessmentRef: z.number().optional(),
  dutyRef: z.number().optional(),
  remarks: z.string().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
});

export type FileDetailsFormData = z.infer<typeof FileDetailsFormSchema>;

export const FilePaymentFormSchema = z.object({
  dutyPaid: z.string().optional(),
  dutyValue: z
    .number()
    .nonnegative('Amount must be positive')
    .refine((val) => !isNaN(val), {
      message: 'Input cannot be empty or not a number',
    })
    .optional(),
  paid: z
    .number()
    .nonnegative('Amount must be positive')
    .refine((val) => !isNaN(val), {
      message: 'Input cannot be empty or not a number',
    })
    .optional(),
  remarks: z.string().optional(),
});

export type FilePaymentFormData = z.infer<typeof FilePaymentFormSchema>;

export const TransactionFormSchema = z.object({
  title: z
    .string()
    .nonempty('Title is required')
    .refine((val) => val != 'Select', { message: 'Choose Bill No' }),
  details: z.string().optional(),
  value: z
    .number({
      required_error: 'Number is required',
      invalid_type_error: 'Input must be a number',
    })
    .nonnegative('Amount must be positive')
    .refine((val) => !isNaN(val), {
      message: 'Input cannot be empty or not a number',
    }),
  date: z.string().nonempty('Date is required'),
});

export type TransactionFormData = z.infer<typeof TransactionFormSchema>;
