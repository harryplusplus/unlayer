import type { Tag } from './types.ts'

/**
 * Create a type-safe service identifier (tag)
 *
 * @example
 * ```ts
 * const UserRepositoryTag = tag<UserRepository>("UserRepository")
 * const DatabaseTag = tag<Database>("Database")
 * ```
 */
export function tag<T>(name: string): Tag<T> {
  return { name, _brand: undefined as unknown as T }
}
