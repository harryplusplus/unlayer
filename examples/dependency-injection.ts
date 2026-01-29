/**
 * Dependency injection example
 *
 * Demonstrates:
 * - Creating services with dependencies using Layer.factory
 * - Chaining multiple dependencies
 * - Sharing dependencies across services
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Define service interfaces
interface Database {
  find(id: string): Promise<{ id: string; name: string } | null>
  insert(data: { name: string }): Promise<{ id: string; name: string }>
}

interface Cache {
  get(_key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

interface UserRepository {
  get(id: string): Promise<{ id: string; name: string } | null>
  create(name: string): Promise<{ id: string; name: string }>
}

interface UserService {
  getUser(id: string): Promise<{ id: string; name: string } | null>
  createUser(name: string): Promise<{ id: string; name: string }>
}

// Create tags
const DatabaseTag = tag<Database>('Database')
const CacheTag = tag<Cache>('Cache')
const UserRepositoryTag = tag<UserRepository>('UserRepository')
const UserServiceTag = tag<UserService>('UserService')

// Database layer (no dependencies)
const DatabaseLive = Layer.value(DatabaseTag, {
  find(id: string) {
    // Simulated database
    return Promise.resolve({ id, name: `User ${id}` })
  },
  insert(data) {
    // Simulated insert
    return Promise.resolve({ id: '1', name: data.name })
  },
})

// Cache layer (no dependencies)
const CacheLive = Layer.value(CacheTag, {
  get(_key: string) {
    // Simulated cache miss
    return Promise.resolve(null)
  },
  set(key: string, value: string) {
    console.log(`Cached: ${key} = ${value}`)
    return Promise.resolve(undefined)
  },
})

// UserRepository depends on Database
const UserRepositoryLive = Layer.factory(
  UserRepositoryTag,
  [DatabaseTag],
  (db) => ({
    get(id: string) {
      return db.find(id)
    },
    create(name: string) {
      return db.insert({ name })
    },
  }),
)

// UserService depends on both UserRepository and Cache
const UserServiceLive = Layer.factory(
  UserServiceTag,
  [UserRepositoryTag, CacheTag],
  (repo, cache) => ({
    async getUser(id: string) {
      // Try cache first
      const cached = await cache.get(`user:${id}`)
      if (cached) {
        return Promise.resolve(
          JSON.parse(cached) as { id: string; name: string },
        )
      }

      // Fall back to repository
      const user = await repo.get(id)
      if (user) {
        await cache.set(`user:${id}`, JSON.stringify(user))
      }
      return user
    },
    createUser(name: string) {
      return repo.create(name)
    },
  }),
)

// Merge all layers and create container
const MainLayer = Layer.merge(
  DatabaseLive,
  CacheLive,
  UserRepositoryLive,
  UserServiceLive,
)
const container = createContainer(MainLayer)

// Use the service
const userService = container.get(UserServiceTag)
void userService.getUser('123').then((user) => {
  console.log('Found user:', user)
})

await container.dispose()
