export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}