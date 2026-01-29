import type {
  Any,
  ExtractTypes,
  LayerOptions,
  MergeOptions,
  Tag,
} from './types.ts'

/**
 * Layer - blueprint for building services
 */
export interface Layer {
  readonly _layer: true
}

class LayerImpl implements Layer {
  readonly _layer = true
  type: 'value' | 'factory' | 'merged'
  tag: Tag<unknown> | undefined
  value: unknown
  dependencies: readonly Tag<unknown>[]
  factory: ((...deps: unknown[]) => unknown) | undefined
  options: LayerOptions<unknown> | undefined
  layers: LayerImpl[] | undefined
  mergeOptions: MergeOptions | undefined

  constructor(
    type: 'value' | 'factory' | 'merged',
    tag: Tag<unknown> | undefined,
    value: unknown,
    dependencies: readonly Tag<unknown>[],
    factory: ((...deps: unknown[]) => unknown) | undefined,
    options: LayerOptions<unknown> | undefined,
    layers: LayerImpl[] | undefined,
    mergeOptions: MergeOptions | undefined,
  ) {
    this.type = type
    this.tag = tag
    this.value = value
    this.dependencies = dependencies
    this.factory = factory
    this.options = options
    this.layers = layers
    this.mergeOptions = mergeOptions
  }

  isMerged(): this is LayerImpl & { layers: LayerImpl[] } {
    return this.type === 'merged'
  }

  isValue(): this is LayerImpl & { tag: Tag<unknown>; value: unknown } {
    return this.type === 'value'
  }

  isFactory(): this is LayerImpl & {
    tag: Tag<unknown>
    dependencies: readonly Tag<unknown>[]
    factory: (...deps: unknown[]) => unknown
  } {
    return this.type === 'factory'
  }
}

function toLayerImpl(layer: Layer): LayerImpl {
  return layer as unknown as LayerImpl
}

/**
 * Layer namespace interface with method overloads
 */
export interface LayerNamespace {
  /**
   * Create a layer with a pre-built value
   */
  value<T>(tag: Tag<T>, value: T): Layer

  /**
   * Create a layer with a factory function (no dependencies)
   */
  factory<T>(tag: Tag<T>, factory: () => T, options?: LayerOptions<T>): Layer

  /**
   * Create a layer with a factory function (dependencies)
   */
  factory<T, const D extends readonly Tag<Any>[]>(
    tag: Tag<T>,
    dependencies: D,
    factory: (...deps: ExtractTypes<D>) => T,
    options?: LayerOptions<T>,
  ): Layer

  /**
   * Merge multiple layers into one (spread)
   */
  merge(...layers: Layer[]): Layer

  /**
   * Merge multiple layers into one (spread with options)
   */
  merge(...layersAndOptions: [...layers: Layer[], options: MergeOptions]): Layer

  /**
   * Merge multiple layers into one (array with options)
   */
  merge(layers: Layer[], options?: MergeOptions): Layer
}

/**
 * Layer namespace for creating and merging layers
 */
export const Layer = {
  value<T>(tag: Tag<T>, value: T): Layer {
    return new LayerImpl(
      'value',
      tag,
      value,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
    )
  },

  factory<T>(
    tag: Tag<T>,
    dependenciesOrFactory: Tag<unknown>[] | (() => T),
    factoryOrOptions?: ((...deps: unknown[]) => T) | LayerOptions<T>,
    options?: LayerOptions<T>,
  ): Layer {
    if (typeof dependenciesOrFactory === 'function') {
      const factory = dependenciesOrFactory as () => T
      const opts = (factoryOrOptions as LayerOptions<T> | undefined) ?? options
      return new LayerImpl(
        'factory',
        tag,
        undefined,
        [],
        factory,
        opts as LayerOptions<unknown>,
        undefined,
        undefined,
      )
    }

    const dependencies = dependenciesOrFactory
    const factory = factoryOrOptions as (...deps: unknown[]) => T
    return new LayerImpl(
      'factory',
      tag,
      undefined,
      dependencies,
      factory,
      options as LayerOptions<unknown>,
      undefined,
      undefined,
    )
  },

  merge(...args: unknown[]): Layer {
    const firstArg = args[0]

    if (Array.isArray(firstArg)) {
      const layers = firstArg as Layer[]
      const options = args[1] as MergeOptions | undefined
      const impls = layers.map(toLayerImpl)
      return new LayerImpl(
        'merged',
        undefined,
        undefined,
        [],
        undefined,
        undefined,
        impls,
        options,
      )
    }

    const layers: Layer[] = []

    for (const arg of args) {
      if (
        typeof arg === 'object' &&
        arg !== null &&
        !('type' in arg) &&
        'allowDuplicates' in arg
      ) {
        return new LayerImpl(
          'merged',
          undefined,
          undefined,
          [],
          undefined,
          undefined,
          layers.map(toLayerImpl),
          arg as MergeOptions,
        )
      }
      layers.push(arg as Layer)
    }

    const impls = layers.map(toLayerImpl)
    return new LayerImpl(
      'merged',
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      impls,
      undefined,
    )
  },
} as unknown as LayerNamespace

/**
 * Get the internal LayerImpl from a Layer
 */
export function getLayerImpl(layer: Layer): LayerImpl {
  return toLayerImpl(layer)
}
