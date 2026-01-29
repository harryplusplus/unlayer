import { describe, expect, it } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/layer.ts'
import { tag } from '../src/tag.ts'

describe('createContainer', () => {
  describe('duplicate detection', () => {
    it('should throw error for duplicate tags by default', () => {
      const ConfigTag = tag<{ timeout: number }>('Config')

      const layer1 = Layer.value(ConfigTag, { timeout: 1000 })
      const layer2 = Layer.value(ConfigTag, { timeout: 2000 })

      expect(() => createContainer(Layer.merge(layer1, layer2))).toThrow(
        'Duplicate tag',
      )
    })

    it('should allow duplicate tags with option', () => {
      const ConfigTag = tag<{ timeout: number }>('Config')

      const layer1 = Layer.value(ConfigTag, { timeout: 1000 })
      const layer2 = Layer.value(ConfigTag, { timeout: 2000 })

      // Use Layer.merge with allowDuplicates option
      const mergedLayer = Layer.merge([layer1, layer2], {
        allowDuplicates: true,
      })

      const container = createContainer(mergedLayer)

      expect(() => container.get(ConfigTag)).not.toThrow()
    })

    it('should allow duplicate tags with spread option', () => {
      const ConfigTag = tag<{ timeout: number }>('Config')

      const layer1 = Layer.value(ConfigTag, { timeout: 1000 })
      const layer2 = Layer.value(ConfigTag, { timeout: 2000 })

      // Use Layer.merge with spread form and options
      const mergedLayer = Layer.merge(layer1, layer2, { allowDuplicates: true })

      const container = createContainer(mergedLayer)

      expect(() => container.get(ConfigTag)).not.toThrow()
    })
  })
})
