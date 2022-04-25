import { resolverSetupFns } from '.'
import { initApolloServer } from '../graphql'
import { prisma } from '../jest.setup'

const server = initApolloServer(resolverSetupFns)

describe('Metrics: Query', () => {
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        {
          id: 1,
          name: 'user1',
          role: 'USER',
        },
        {
          id: 2,
          name: 'user2',
          role: 'USER',
        },
      ],
    })
    await prisma.post.createMany({
      data: [
        {
          title: 'post1',
          authorId: 1,
        },
      ],
    })
  })
  it('expect to return "metrics" according to conditions', async () => {
    const query = `
        query {
          metrics {
            userCount
            postCount
          }
        }
      `
    const queryResult = await server.executeOperation({
      query,
    })

    expect(queryResult.errors).toBeUndefined()
    expect(queryResult.data).toEqual({
      metrics: {
        userCount: 2,
        postCount: 1,
      },
    })
  })
})
