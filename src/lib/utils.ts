export type ClassValue = string | false | null | undefined;

/** Join conditional class names. Falsy values are dropped. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
