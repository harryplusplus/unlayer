import { describe, expect, it } from 'vitest'

import { createContainer } from '../src/container.ts'
import { Layer } from '../src/index.ts'
import { tag } from '../src/tag.ts'

describe('createContainer', () => {
  describe('singleton scope', () => {
    it('should return the same instance for singleton scope (default)', () => {
      const CounterTag = tag<{ count: number }>('Counter')
      let count = 0

      const counterLayer = Layer.factory(CounterTag, [], () => {
        count++
        return { count }
      })

      const container = createContainer(counterLayer)

      const instance1 = container.get(CounterTag)
      const instance2 = container.get(CounterTag)

      expect(instance1).toBe(instance2)
      expect(count).toBe(1)
    })
  })

  describe('transient scope', () => {
    it('should create new instances for transient scope', () => {
      const CounterTag = tag<{ count: number }>('Counter')
      let count = 0

      const counterLayer = Layer.factory(
        CounterTag,
        [],
        () => {
          count++
          return { count }
        },
        { scope: 'transient' },
      )

      const container = createContainer(counterLayer)

      const instance1 = container.get(CounterTag)
      const instance2 = container.get(CounterTag)

      expect(instance1).not.toBe(instance2)
      expect(count).toBe(2)
    })
  })
})
