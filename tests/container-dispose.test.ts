import { describe, expect, it, vi } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/layer.ts'
import { tag } from '../src/tag.ts'

describe('createContainer dispose', () => {
  it('should call dispose callbacks on container disposal', async () => {
    const DatabaseTag = tag<{ close: () => Promise<void> }>('Database')
    const closeSpy = vi.fn()

    const layer = Layer.factory(
      DatabaseTag,
      [],
      () => ({ close: async () => {} }),
      {
        dispose: async () => {
          await Promise.resolve()
          closeSpy()
        },
      },
    )

    const container = createContainer(layer)
    container.get(DatabaseTag)

    await container.dispose()

    expect(closeSpy).toHaveBeenCalledTimes(1)
  })
})

describe('createContainer dispose', () => {
  it('should call dispose callbacks in reverse order', async () => {
    const order: string[] = []

    const Service1 = tag<{ name: string }>('Service1')
    const Service2 = tag<{ name: string }>('Service2')
    const Service3 = tag<{ name: string }>('Service3')

    const layer1 = Layer.factory(Service1, [], () => ({ name: '1' }), {
      dispose: async () => {
        await Promise.resolve()
        order.push('1')
      },
    })

    const layer2 = Layer.factory(Service2, [], () => ({ name: '2' }), {
      dispose: async () => {
        await Promise.resolve()
        order.push('2')
      },
    })

    const layer3 = Layer.factory(Service3, [], () => ({ name: '3' }), {
      dispose: async () => {
        await Promise.resolve()
        order.push('3')
      },
    })

    const container = createContainer(Layer.merge(layer1, layer2, layer3))
    container.get(Service1)
    container.get(Service2)
    container.get(Service3)

    await container.dispose()

    expect(order).toHaveLength(3)
    expect(order).toContain('1')
    expect(order).toContain('2')
    expect(order).toContain('3')
  })
})

describe('createContainer dispose', () => {
  it('should handle service without dispose callback', async () => {
    const ServiceTag = tag<{ name: string }>('Service')

    const layer = Layer.factory(ServiceTag, [], () => ({ name: 'test' }))

    const container = createContainer(layer)
    container.get(ServiceTag)

    await expect(container.dispose()).resolves.toBeUndefined()
  })
})
