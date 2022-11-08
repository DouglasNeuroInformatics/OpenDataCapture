export function extractNonAlphabeticChars(s: string): string[] | null {
  return s.toUpperCase().match(/[^A-Z\s]/g);
}