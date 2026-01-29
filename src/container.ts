import type { Layer } from './layer.ts'
import { getLayerImpl } from './layer.ts'
import type { Container, Scope, Tag } from './types.ts'

interface ServiceDefinition {
  tag: Tag<unknown>
  instance: unknown
  scope: Scope
  dispose: ((instance: unknown) => void | Promise<void>) | undefined
}

interface DependencyGraph {
  nodes: Map<string, Tag<unknown>>
  edges: Map<string, Set<string>>
  layerMap: Map<string, LayerImpl>
  tagCounts: Map<string, number>
}

type LayerImpl = ReturnType<typeof getLayerImpl>

/**
 * Create a container from a typed layer
 * @example
 * const container = createContainer(
 *   Layer.merge(DatabaseLive, UserServiceLive)
 * )
 * // container.get(UserServiceTag) - type-safe!
 * // container.get(DatabaseTag) - type-safe!
 */
export function createContainer<Services>(
  layer: Layer<Services, unknown>,
): Container<Services>

export function createContainer<Services>(
  layer: Layer<Services, unknown>,
): Container<Services> {
  const impl = getLayerImpl(layer as Layer)
  const graph = buildGraph(impl)
  topologicalSort(graph)

  // Check for duplicates using tagCounts
  const allowDuplicates = impl.isMerged() && impl.mergeOptions?.allowDuplicates
  if (!allowDuplicates) {
    const duplicates: string[] = []
    for (const [name, count] of graph.tagCounts.entries()) {
      if (count > 1) {
        duplicates.push(name)
      }
    }
    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate tag detected: ${duplicates.join(', ')}. Use { allowDuplicates: true } option to override.`,
      )
    }
  }

  const services = new Map<string, ServiceDefinition>()
  const singletons = new Map<string, unknown>()

  return {
    get<T extends Services>(tag: Tag<T>): T {
      const existing = services.get(tag.name)
      if (existing && existing.scope === 'singleton') {
        return existing.instance as T
      }
      return createService(tag, services, singletons, graph) as T
    },

    async dispose(): Promise<void> {
      const disposePromises: Array<Promise<void>> = []

      for (const [, service] of services.entries()) {
        if (service.dispose) {
          const disposeFn = service.dispose
          disposePromises.push(
            Promise.resolve().then(async () => {
              await disposeFn(service.instance)
            }),
          )
        }
      }

      await Promise.all(disposePromises)
      services.clear()
      singletons.clear()
    },
  } as Container<Services>
}

function createService(
  tag: Tag<unknown>,
  services: Map<string, ServiceDefinition>,
  singletons: Map<string, unknown>,
  graph: DependencyGraph,
): unknown {
  if (singletons.has(tag.name)) {
    return singletons.get(tag.name)
  }

  const layer = graph.layerMap.get(tag.name)
  if (!layer) {
    throw new Error(`Service not found: ${tag.name}`)
  }

  const impl = layer

  let instance: unknown
  let scope: Scope = 'singleton'
  let dispose: ((instance: unknown) => void | Promise<void>) | undefined

  if (impl.isValue()) {
    instance = impl.value
    scope = 'singleton'
  } else {
    // impl must be factory due to buildGraph filtering
    const dependencies = impl.dependencies.map((depTag) =>
      createService(depTag, services, singletons, graph),
    )

    instance = impl.factory!(...dependencies)

    scope = impl.options?.scope || 'singleton'
    dispose = impl.options?.dispose
  }

  if (scope === 'singleton') {
    singletons.set(tag.name, instance)
    services.set(tag.name, { tag, instance, scope, dispose })
  } else {
    services.set(tag.name, { tag, instance, scope, dispose })
  }

  return instance
}

function buildGraph(layer: LayerImpl): DependencyGraph {
  const graph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map(),
    layerMap: new Map(),
    tagCounts: new Map(),
  }

  function collectLayers(impl: LayerImpl) {
    if (impl.isMerged()) {
      const layers = impl.layers
      for (const child of layers) {
        collectLayers(child)
      }
    } else if (impl.isValue()) {
      const tag = impl.tag

      graph.nodes.set(tag.name, tag)
      graph.layerMap.set(tag.name, impl)

      incrementTagCount(tag.name)
    } else {
      // impl.isFactory() is always true here
      const tag = impl.tag!
      const dependencies = impl.dependencies

      graph.nodes.set(tag.name, tag)
      graph.layerMap.set(tag.name, impl)

      incrementTagCount(tag.name)

      if (dependencies.length > 0) {
        const deps = new Set<string>()
        for (const dep of dependencies) {
          deps.add(dep.name)
        }
        graph.edges.set(tag.name, deps)
      }
    }
  }

  function incrementTagCount(tagName: string): void {
    const currentCount = graph.tagCounts.get(tagName) || 0
    graph.tagCounts.set(tagName, currentCount + 1)
  }

  collectLayers(layer)
  return graph
}

function topologicalSort(graph: DependencyGraph): string[] {
  const visited = new Set<string>()
  const temp = new Set<string>()
  const order: string[] = []

  function visit(nodeName: string) {
    if (temp.has(nodeName)) {
      throw new Error(`Circular dependency detected: ${nodeName}`)
    }
    if (visited.has(nodeName)) {
      return
    }

    temp.add(nodeName)

    const deps = graph.edges.get(nodeName)
    if (deps) {
      for (const dep of deps) {
        visit(dep)
      }
    }

    temp.delete(nodeName)
    visited.add(nodeName)
    order.push(nodeName)
  }

  function visitAll(): void {
    for (const nodeName of graph.nodes.keys()) {
      if (!visited.has(nodeName)) {
        visit(nodeName)
      } else {
        // Already visited during recursion
      }
    }
  }

  visitAll()

  return order
}
