export const toArray = <T>(value: T | readonly T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value
  return value === null || value === undefined ? [] : [value] as T[]
}
