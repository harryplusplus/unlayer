import { describe, expect, it } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/index.ts'
import { tag } from '../src/tag.ts'

describe('createContainer dependency resolution', () => {
  it('should handle already visited nodes during topological sort', () => {
    // A depends on B
    // When we process the nodes in visitAll(), if we encounter A first,
    // we visit A which then visits B. Then when we encounter B in the loop,
    // it's already visited, triggering the else branch at line 209
    const TagA = tag<{ name: string }>('A')
    const TagB = tag<{ name: string }>('B')

    const layerB = Layer.value(TagB, { name: 'B' })
    const layerA = Layer.factory(TagA, [TagB], (b) => ({
      name: `A depends on ${b.name}`,
    }))

    const container = createContainer(Layer.merge(layerA, layerB))
    const a = container.get(TagA)

    expect(a.name).toBe('A depends on B')
  })
})
