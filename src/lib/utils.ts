import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

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