/**
 * Transient scope example
 *
 * Demonstrates:
 * - Singleton scope (default) - same instance every time
 * - Transient scope - new instance every time
 * - When to use each scope
 */

import { createContainer, Layer, tag } from '../src/index.ts'

// Define a service with internal state
interface Counter {
  id: string
  count: number
  increment(): void
}

const CounterTag = tag<Counter>('Counter')
let instanceCount = 0

// Singleton scope (default) - same instance every time
const SingletonCounterLive = Layer.factory(CounterTag, [], () => {
  instanceCount++
  const id = `singleton-${instanceCount}`
  let count = 0
  return {
    id,
    get count() {
      return count
    },
    increment() {
      count++
    },
  }
})

const TransientCounterTag = tag<Counter>('TransientCounter')

// Transient scope - new instance every time
const TransientCounterLive = Layer.factory(
  TransientCounterTag,
  [],
  () => {
    instanceCount++
    const id = `transient-${instanceCount}`
    let count = 0
    return {
      id,
      get count() {
        return count
      },
      increment() {
        count++
      },
    }
  },
  { scope: 'transient' },
)

// Test singleton scope
console.log('=== Singleton Scope ===')
const singletonContainer = createContainer(SingletonCounterLive)
const s1 = singletonContainer.get(CounterTag)
const s2 = singletonContainer.get(CounterTag)

console.log(`Instance 1: ${s1.id}, count: ${s1.count}`)
s1.increment()
console.log(`Instance 2: ${s2.id}, count: ${s2.count}`) // Same instance, count is 1
console.log(`Same instance? ${s1 === s2}`)

// Test transient scope
console.log('\n=== Transient Scope ===')
instanceCount = 0
const transientContainer = createContainer(TransientCounterLive)
const t1 = transientContainer.get(TransientCounterTag)
const t2 = transientContainer.get(TransientCounterTag)

console.log(`Instance 1: ${t1.id}, count: ${t1.count}`)
t1.increment()
console.log(`Instance 2: ${t2.id}, count: ${t2.count}`) // Different instance, count is 0
console.log(`Same instance? ${t1 === t2}`)

await singletonContainer.dispose()
await transientContainer.dispose()
