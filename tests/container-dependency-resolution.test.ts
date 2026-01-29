import { describe, expect, it } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/index.ts'
import { tag } from '../src/tag.ts'

describe('createContainer dependency resolution', () => {
  it('should resolve dependencies in correct order', () => {
    const order: string[] = []

    const ConfigTag = tag<{ name: string }>('Config')
    const DatabaseTag = tag<{ config: { name: string } }>('Database')
    const UserServiceTag = tag<{
      db: { config: { name: string } }
      config: { name: string }
    }>('UserService')

    const configLayer = Layer.factory(ConfigTag, [], () => {
      order.push('config')
      return { name: 'config' }
    })

    const databaseLayer = Layer.factory(DatabaseTag, [ConfigTag], (config) => {
      order.push('database')
      return { config }
    })

    const userServiceLayer = Layer.factory(
      UserServiceTag,
      [DatabaseTag, ConfigTag],
      (db, config) => {
        order.push('userService')
        return { db, config }
      },
    )

    const container = createContainer(
      Layer.merge(configLayer, databaseLayer, userServiceLayer),
    )

    container.get(UserServiceTag)

    expect(order).toEqual(['config', 'database', 'userService'])
  })
})

describe('createContainer dependency resolution', () => {
  it('should throw error for missing services', () => {
    const UserServiceTag = tag<{ getUser: () => void }>('UserService')
    const DatabaseTag = tag<{ find: () => void }>('Database')

    const userServiceLayer = Layer.factory(
      UserServiceTag,
      [DatabaseTag],
      (db) => ({ getUser: () => db.find() }),
    )

    const container = createContainer(userServiceLayer)

    expect(() => container.get(UserServiceTag)).toThrow(
      'Service not found: Database',
    )
  })
})

describe('createContainer dependency resolution', () => {
  it('should detect circular dependencies', () => {
    const ServiceA = tag<{ dep: unknown }>('ServiceA')
    const ServiceB = tag<{ dep: unknown }>('ServiceB')

    const layerA = Layer.factory(ServiceA, [ServiceB], (b) => ({ dep: b }))
    const layerB = Layer.factory(ServiceB, [ServiceA], (a) => ({ dep: a }))

    expect(() => createContainer(Layer.merge(layerA, layerB))).toThrow(
      'Circular dependency',
    )
  })
})
