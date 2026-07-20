import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*
  cn = className merge helper

  Why?
  clsx -> conditional classes handle pannum
  twMerge -> duplicate tailwind classes remove pannum

  Example:
  cn("p-2", true && "p-4")
  final => "p-4"
*/

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}











