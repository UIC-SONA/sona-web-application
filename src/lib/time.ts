export function getPeriod(number: number): string {
  return number < 12 ? "AM" : "PM";
}