import { describe, expect, it } from 'vitest'

import { tag } from '../src/tag.ts'
import type { Tag } from '../src/types.ts'

describe('tag', () => {
  it('should create a tag with a name', () => {
    const TestTag = tag<{ hello: string }>('TestService')
    expect(TestTag.name).toBe('TestService')
  })

  it('should create unique tags even with same name', () => {
    const Tag1 = tag<{ value: string }>('Service')
    const Tag2 = tag<{ value: string }>('Service')

    expect(Tag1).not.toBe(Tag2)
    expect(Tag1.name).toBe(Tag2.name)
  })

  it('should provide type safety', () => {
    interface UserRepository {
      find(id: string): Promise<{ id: string; name: string } | null>
    }

    const UserRepositoryTag = tag<UserRepository>('UserRepository')

    // This should type check - Tag<UserRepository> can be assigned to Tag<UserRepository>
    const sameType: Tag<UserRepository> = UserRepositoryTag
    expect(sameType).toBe(UserRepositoryTag)

    // Type narrowing should work
    if (typeof UserRepositoryTag === 'object' && 'name' in UserRepositoryTag) {
      expect(UserRepositoryTag.name).toBe('UserRepository')
    }
  })

  it('should work with generic types', () => {
    const RepositoryTag = tag<{ get: (id: string) => Promise<unknown> }>(
      'Repository',
    )
    expect(RepositoryTag.name).toBe('Repository')
  })
})
