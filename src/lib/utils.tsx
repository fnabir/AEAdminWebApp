import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import {
  child,
  DatabaseReference,
  DataSnapshot,
  get,
  push,
  ref,
} from '@firebase/database';
import { database } from '@/firebase/config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showToast(
  title?: string,
  description?: string,
  variant?: 'default' | 'success' | 'error',
) {
  switch (variant) {
    case 'success':
      toast.success(title, {
        description: description ? description : '',
      });
      break;
    case 'error':
      toast.error(title, {
        description: description ? description : '',
      });
      break;
    default:
      toast(title, {
        description: description ? description : '',
      });
  }
}

export function generateDatabaseKey(databaseReference: string): string {
  return push(child(ref(database), databaseReference)).key!;
}

export function getDatabaseReference(
  databaseReference?: string,
): DatabaseReference {
  if (!databaseReference || databaseReference.trim() === '') {
    return ref(database);
  }
  return child(ref(database), databaseReference);
}

export async function getDatabaseReferenceExists(
  databaseReference: string,
): Promise<boolean> {
  const snapshot = await get(getDatabaseReference(databaseReference));
  return snapshot.exists();
}

export function getTotalValue(data: DataSnapshot[] | undefined): number {
  if (!data) return 0;
  else {
    return data.reduce((sum, snap) => {
      const data = snap.val();
      return sum + (data.value || 0);
    }, 0);
  }
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function formatCurrency(
  initialValue: number,
  precision: number = 0,
  symbol: string = '৳',
): string {
  const signed = initialValue < 0;
  const absValue = Math.abs(initialValue);
  const strValue = absValue.toFixed(precision);
  const [intPart, decimalPart] = strValue.split('.');
  const formattedValue = intPart.replace(/(\d)(?=(\d{3})(\d{2})*$)/g, '$1,');
  const cents = precision > 0 ? decimalPart : '';

  return `${signed ? '-' : ''} ${symbol} ${formattedValue.split('').join('')}${
    precision > 0 ? '.' + cents : ''
  }`;
}

export function generateFileCode(
  fileNo: number,
  fileYear: number,
  type?: 'export' | 'import',
): string {
  if (fileNo < 0) {
    throw new Error('File number cannot be negative.');
  }
  if (fileYear < 2000 || fileYear > 9999) {
    throw new Error('Invalid file year.');
  }
  const typeCode = type ? type.slice(0, 3).toUpperCase() : 'IMP';
  const fileNoFormatted = fileNo.toString().padStart(2, '0');
  return `AE/${typeCode}/${fileNoFormatted}/${fileYear}`;
}
