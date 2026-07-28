import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakh(amount: number): string {
  if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(2);
    return `₹${lakhs} Lakh`;
  }
  return formatINR(amount);
}

export function calculateDaysRemaining(deadlineDateStr: string): number {
  const deadline = new Date(deadlineDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
