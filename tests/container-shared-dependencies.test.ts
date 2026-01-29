import { describe, expect, it } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/index.ts'
import { tag } from '../src/tag.ts'

describe('createContainer shared dependencies', () => {
  it('should handle shared dependencies correctly', () => {
    const SharedTag = tag<{ name: string }>('Shared')
    const Service1Tag = tag<{ shared: { name: string } }>('Service1')
    const Service2Tag = tag<{ shared: { name: string } }>('Service2')

    const sharedLayer = Layer.factory(SharedTag, [], () => ({ name: 'shared' }))
    const service1Layer = Layer.factory(Service1Tag, [SharedTag], (shared) => ({
      shared,
    }))
    const service2Layer = Layer.factory(Service2Tag, [SharedTag], (shared) => ({
      shared,
    }))

    const container = createContainer(
      Layer.merge(sharedLayer, service1Layer, service2Layer),
    )

    const s1 = container.get(Service1Tag)
    const s2 = container.get(Service2Tag)

    expect(s1.shared.name).toBe('shared')
    expect(s2.shared.name).toBe('shared')
  })
})

describe('createContainer shared dependencies', () => {
  it('should handle complex shared dependency graph', () => {
    const SharedTag = tag<{ name: string }>('Shared')
    const Service1Tag = tag<{ shared: { name: string } }>('Service1')
    const Service2Tag = tag<{ shared: { name: string } }>('Service2')
    const Service3Tag = tag<{ shared: { name: string } }>('Service3')

    const sharedLayer = Layer.factory(SharedTag, [], () => ({ name: 'shared' }))
    const service1Layer = Layer.factory(Service1Tag, [SharedTag], (shared) => ({
      shared,
    }))
    const service2Layer = Layer.factory(Service2Tag, [SharedTag], (shared) => ({
      shared,
    }))
    const service3Layer = Layer.factory(Service3Tag, [SharedTag], (shared) => ({
      shared,
    }))

    const container = createContainer(
      Layer.merge(sharedLayer, service1Layer, service2Layer, service3Layer),
    )

    const s1 = container.get(Service1Tag)
    const s2 = container.get(Service2Tag)
    const s3 = container.get(Service3Tag)

    expect(s1.shared.name).toBe('shared')
    expect(s2.shared.name).toBe('shared')
    expect(s3.shared.name).toBe('shared')
  })
})

describe('createContainer shared dependencies', () => {
  it('should handle multiple get calls with shared dependencies', () => {
    const SharedTag = tag<{ name: string }>('Shared')
    const Service1Tag = tag<{ shared: { name: string } }>('Service1')
    const Service2Tag = tag<{ shared: { name: string } }>('Service2')

    const sharedLayer = Layer.factory(SharedTag, [], () => ({ name: 'shared' }))
    const service1Layer = Layer.factory(Service1Tag, [SharedTag], (shared) => ({
      shared,
    }))
    const service2Layer = Layer.factory(Service2Tag, [SharedTag], (shared) => ({
      shared,
    }))

    const container = createContainer(
      Layer.merge(sharedLayer, service1Layer, service2Layer),
    )

    const s1a = container.get(Service1Tag)
    const s1b = container.get(Service1Tag)
    const s2 = container.get(Service2Tag)

    expect(s1a.shared.name).toBe('shared')
    expect(s1b.shared.name).toBe('shared')
    expect(s2.shared.name).toBe('shared')

    expect(s1a).toBe(s1b)
  })
})
