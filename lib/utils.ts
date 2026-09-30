import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
}

export function coinsToDollars(coins: number) {
  return (Number(coins || 0) / 20).toFixed(2);
}

export const COIN_PACKS = [
  { coins: 10, price: 1, label: "Starter", tagline: "Try the marketplace" },
  { coins: 150, price: 10, label: "Growth", tagline: "Most popular for buyers" },
  { coins: 500, price: 20, label: "Pro", tagline: "Best value per coin" },
  { coins: 1000, price: 35, label: "Scale", tagline: "For power buyers" },
];

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong", "Excellent"];
  return { score, label: labels[Math.min(score, 5)] };
}
