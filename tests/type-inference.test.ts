/**
 * Type inference tests
 *
 * Verifies that dependency arrays are correctly inferred as tuples
 * using const type parameters (without requiring 'as const').
 */

import { describe, expect, it } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/layer.ts'
import { tag } from '../src/tag.ts'

describe('Type inference without as const - single dependency', () => {
  it('should infer types correctly', () => {
    interface Config {
      port: number
    }

    const ConfigTag = tag<Config>('Config')

    interface Database {
      getConfig(): Config
    }

    const DatabaseTag = tag<Database>('Database')

    // No 'as const' - const type parameter handles inference
    const layer = Layer.factory(DatabaseTag, [ConfigTag], (config) => ({
      getConfig: () => config,
    }))

    const container = createContainer(
      Layer.merge(Layer.value(ConfigTag, { port: 3000 }), layer),
    )
    const db = container.get(DatabaseTag)

    expect(db.getConfig().port).toBe(3000)
  })
})

describe('Type inference without as const - two dependencies', () => {
  it('should infer types correctly', () => {
    interface Database {
      query: () => string
    }

    interface Logger {
      log: (msg: string) => void
    }

    const DatabaseTag = tag<Database>('Database')
    const LoggerTag = tag<Logger>('Logger')

    interface Service {
      doWork(): string
    }

    const ServiceTag = tag<Service>('Service')

    // No 'as const' - const type parameter handles inference
    const layer = Layer.factory(
      ServiceTag,
      [DatabaseTag, LoggerTag],
      (db, logger) => ({
        doWork: () => {
          logger.log(db.query())
          return 'done'
        },
      }),
    )

    const container = createContainer(
      Layer.merge(
        Layer.value(DatabaseTag, { query: () => 'result' }),
        Layer.value(LoggerTag, { log: () => {} }),
        layer,
      ),
    )
    const service = container.get(ServiceTag)

    expect(service.doWork()).toBe('done')
  })
})

describe('Type inference without as const - three dependencies', () => {
  it('should infer types correctly', () => {
    interface Config {
      apiUrl: string
    }

    interface Database {
      find: (id: string) => string
    }

    interface Cache {
      get: (_key: string) => string | null
    }

    const ConfigTag = tag<Config>('Config')
    const DatabaseTag = tag<Database>('Database')
    const CacheTag = tag<Cache>('Cache')

    interface UserService {
      getUser: (id: string) => string | null
    }

    const UserServiceTag = tag<UserService>('UserService')

    // No 'as const' - const type parameter handles inference
    const layer = Layer.factory(
      UserServiceTag,
      [ConfigTag, DatabaseTag, CacheTag],
      (_config, db, cache) => ({
        getUser: (id: string) => {
          const cached = cache.get(`user:${id}`)
          if (cached) {
            return cached
          }
          return db.find(id)
        },
      }),
    )

    const container = createContainer(
      Layer.merge(
        Layer.value(ConfigTag, { apiUrl: 'http://localhost' }),
        Layer.value(DatabaseTag, { find: () => 'user-1' }),
        Layer.value(CacheTag, { get: () => null }),
        layer,
      ),
    )
    const userService = container.get(UserServiceTag)

    expect(userService.getUser('1')).toBe('user-1')
  })
})

describe('Type inference without as const - four dependencies', () => {
  it('should infer types correctly', () => {
    const Tag1 = tag<{ a: string }>('Tag1')
    const Tag2 = tag<{ b: number }>('Tag2')
    const Tag3 = tag<{ c: boolean }>('Tag3')
    const Tag4 = tag<{ d: string }>('Tag4')

    const ServiceTag = tag<{ combine: () => string }>('Service')

    // No 'as const' - const type parameter handles inference
    const layer = Layer.factory(
      ServiceTag,
      [Tag1, Tag2, Tag3, Tag4],
      (t1, t2, t3, t4) => ({
        combine: () => {
          return `${t1.a} ${t2.b} ${t3.c} ${t4.d}`
        },
      }),
    )

    const container = createContainer(
      Layer.merge(
        Layer.value(Tag1, { a: 'test' }),
        Layer.value(Tag2, { b: 42 }),
        Layer.value(Tag3, { c: true }),
        Layer.value(Tag4, { d: 'date' }),
        layer,
      ),
    )

    const service = container.get(ServiceTag)

    expect(service.combine()).toBe('test 42 true date')
  })
})

describe('Type inference without as const - type safety', () => {
  it('should maintain type safety with inferred tuples', () => {
    interface A {
      aMethod(): string
    }

    interface B {
      bMethod(): number
    }

    const TagA = tag<A>('TagA')
    const TagB = tag<B>('TagB')

    const ServiceTag = tag<{ useA: () => string; useB: () => number }>(
      'Service',
    )

    // No 'as const' - const type parameter handles inference
    const layer = Layer.factory(ServiceTag, [TagA, TagB], (a, b) => ({
      useA: () => a.aMethod(),
      useB: () => b.bMethod(),
    }))

    const container = createContainer(
      Layer.merge(
        Layer.value(TagA, { aMethod: () => 'a' }),
        Layer.value(TagB, { bMethod: () => 1 }),
        layer,
      ),
    )

    const service = container.get(ServiceTag)

    expect(service.useA()).toBe('a')
    expect(service.useB()).toBe(1)
  })
})
