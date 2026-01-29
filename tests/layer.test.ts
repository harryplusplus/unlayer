import { describe, expect, it } from 'vitest'

import { getLayerImpl, Layer } from '../src/layer.ts'
import { tag } from '../src/tag.ts'

describe('Layer', () => {
  describe('value', () => {
    it('should create a layer with a pre-built value', () => {
      const ConfigTag = tag<{ apiUrl: string; timeout: number }>('Config')

      const config = { apiUrl: 'https://api.example.com', timeout: 5000 }
      const layer = Layer.value(ConfigTag, config)

      const impl = getLayerImpl(layer)
      expect(impl.isValue()).toBe(true)
      expect(impl.value).toBe(config)
    })
  })
})

describe('Layer.factory without dependencies', () => {
  it('should create a layer with factory function', () => {
    const LoggerTag = tag<{ log: (message: string) => void }>('Logger')

    const layer = Layer.factory(LoggerTag, () => ({
      log: (message: string) => console.log(message),
    }))

    const impl = getLayerImpl(layer)
    expect(impl.isFactory()).toBe(true)
    expect(impl.dependencies).toEqual([])
  })
})

describe('Layer.factory with dependencies', () => {
  it('should create a layer with factory function', () => {
    const DatabaseTag = tag<{ find: (id: string) => Promise<unknown> }>(
      'Database',
    )
    const CacheTag = tag<{ get: (id: string) => Promise<unknown> }>('Cache')
    const UserServiceTag = tag<{ getUser: (id: string) => Promise<unknown> }>(
      'UserService',
    )

    const layer = Layer.factory(
      UserServiceTag,
      [DatabaseTag, CacheTag],

      (db, cache) => ({
        getUser: async (id: string) => {
          const cached = await cache.get(id)
          if (cached) return cached
          return db.find(id)
        },
      }),
    )

    const impl = getLayerImpl(layer)
    expect(impl.isFactory()).toBe(true)
    expect(impl.dependencies).toEqual([DatabaseTag, CacheTag])
    expect(impl.tag).toBe(UserServiceTag)
  })

  it('should infer types from dependencies array', () => {
    const DatabaseTag = tag<{ find: (id: string) => Promise<string> }>(
      'Database',
    )
    const UserServiceTag = tag<{ getUser: (id: string) => Promise<string> }>(
      'UserService',
    )

    const layer = Layer.factory(UserServiceTag, [DatabaseTag], (db) => ({
      getUser: async (id: string) => {
        return db.find(id)
      },
    }))

    const impl = getLayerImpl(layer)
    expect(impl.isFactory()).toBe(true)
  })
})

describe('Layer.factory dispose option', () => {
  it('should support dispose option', () => {
    const DatabaseTag = tag<{ close: () => Promise<void> }>('Database')

    const layer = Layer.factory(
      DatabaseTag,
      [],
      () => ({ close: async () => {} }),
      {
        dispose: async (db) => {
          await db.close()
        },
      },
    )

    const impl = getLayerImpl(layer)
    expect(impl.options?.dispose).toBeDefined()
  })
})

describe('Layer.factory scope option', () => {
  it('should support transient scope', () => {
    const CacheTag = tag<{ get: (key: string) => unknown }>('Cache')

    const layer = Layer.factory(
      CacheTag,
      [],
      () => ({ get: (key: string) => key }),
      { scope: 'transient' },
    )

    const impl = getLayerImpl(layer)
    expect(impl.options?.scope).toBe('transient')
  })
})

describe('Layer.merge spread', () => {
  it('should merge multiple layers (spread)', () => {
    const ConfigTag = tag<{ timeout: number }>('Config')
    const DatabaseTag = tag<{ find: (id: string) => unknown }>('Database')
    const UserServiceTag = tag<{ getUser: (id: string) => unknown }>(
      'UserService',
    )

    const configLayer = Layer.value(ConfigTag, { timeout: 5000 })
    const databaseLayer = Layer.value(DatabaseTag, { find: () => {} })
    const userServiceLayer = Layer.value(UserServiceTag, { getUser: () => {} })

    const merged = Layer.merge(configLayer, databaseLayer, userServiceLayer)

    const impl = getLayerImpl(merged)
    expect(impl.isMerged()).toBe(true)
    expect(impl.layers).toHaveLength(3)
  })
})

describe('Layer.merge array', () => {
  it('should merge multiple layers (array)', () => {
    const ConfigTag = tag<{ timeout: number }>('Config')
    const DatabaseTag = tag<{ find: (id: string) => unknown }>('Database')

    const configLayer = Layer.value(ConfigTag, { timeout: 5000 })
    const databaseLayer = Layer.value(DatabaseTag, { find: () => {} })

    const merged = Layer.merge([configLayer, databaseLayer])

    const impl = getLayerImpl(merged)
    expect(impl.isMerged()).toBe(true)
    expect(impl.layers).toHaveLength(2)
  })
})

describe('Layer.merge options', () => {
  it('should support allowDuplicates option', () => {
    const ConfigTag = tag<{ timeout: number }>('Config')

    const layer1 = Layer.value(ConfigTag, { timeout: 1000 })
    const layer2 = Layer.value(ConfigTag, { timeout: 2000 })

    const merged = Layer.merge([layer1, layer2], { allowDuplicates: true })

    const impl = getLayerImpl(merged)
    expect(impl.mergeOptions?.allowDuplicates).toBe(true)
  })
})
