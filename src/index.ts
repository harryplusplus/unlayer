/**
 * unlayer - A type-safe dependency injection container
 *
 * Inspired by Effect.ts Layer system.
 *
 * @example
 * ```ts
 * import { tag, Layer, createContainer } from 'unlayer'
 *
 * // Define service tags
 * const DatabaseTag = tag<Database>("Database")
 * const UserServiceTag = tag<UserService>("UserService")
 *
 * // Define layers
 * const DatabaseLive = Layer.value(DatabaseTag, new Database())
 * const UserServiceLive = Layer.factory(
 *   UserServiceTag,
 *   [DatabaseTag],
 *   (db) => ({
 *     async getUser(id: string) {
 *       return db.find(id)
 *     }
 *   })
 * )
 *
 * // Create container and use services
 * const container = createContainer(
 *   Layer.merge(DatabaseLive, UserServiceLive)
 * )
 * const userService = container.get(UserServiceTag)
 * await container.dispose()
 * ```
 */

// Type definitions
export type {
  Container,
  GetIn,
  GetOut,
  LayerOptions,
  MergeIn,
  MergeOptions,
  MergeOut,
  Scope,
  Tag,
} from './types.ts'

// Tag creation
export { tag } from './tag.ts'

// Layer (type and namespace)
export { Layer } from './layer.ts'
export { getLayerImpl } from './layer.ts'

// Container creation
export { createContainer } from './container.ts'
