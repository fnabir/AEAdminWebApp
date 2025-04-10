import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"
import {child, DatabaseReference, DataSnapshot, push, ref} from "@firebase/database";
import {database} from "@/firebase/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function showToast(title?: string, description?: string, variant?: "default" | "success" | "error") {
  switch(variant) {
    case "success":
      toast.success(title, {
        description: description ? description : "",
      })
      break
    case "error":
      toast.error(title, {
        description: description ? description : "",
      })
      break
    default:
      toast(title, {
        description: description ? description : "",
      });
  }
}

export function generateDatabaseKey(databaseReference: string) : string {
  return push(child(ref(database), databaseReference)).key!
}

export function getDatabaseReference(databaseReference: string) : DatabaseReference {
  return child(ref(database), databaseReference);
}

export function getTotalValue(data:DataSnapshot[] | undefined) : number {
  if (!data) return 0;
  else {
    return data.reduce((sum, snap) => {
      const data = snap.val();
      return sum + (data.value || 0);
    }, 0);
  }
}

export function formatCurrency(initialValue: number, precision: number=0): string {
  let signed: boolean = true
  if (initialValue >= 0) signed = false

  const strValue = String(Math.abs(initialValue));
  const split = strValue.split('.');
  const formattedValue = split[0].replace(/(\d)(?=(\d{3})(\d{2})*$)/g, '$1,');
  const cents = split.length > 1 ? String(split[1]).padEnd(precision, '0') : '0'.repeat(precision);

  return `${signed ? '-' : '' } ৳ ${formattedValue.split('').join('')}
    ${precision > 0 ? '.' + cents : ''}`;
}