import { ExecutionResult, parse, subscribe } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { resolverSetupFns } from '.'
import { initTestApolloServer, pg } from '../graphql'
import { prisma } from '../jest.setup'

const server = initTestApolloServer(resolverSetupFns)

describe('Post: Query', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        id: 1,
        name: 'user1',
        role: 'USER',
        posts: {
          create: [
            {
              title: 'first post',
            },
            {
              title: 'second post',
            },
          ],
        },
      },
    })
  })
  it('expect to return posts according to conditions', async () => {
    const query = `
      query {
        posts (where: { authorId: 1 }, orderBy: { id: "desc" }) {
          id
          title
          published
          author {
            id
            name
          }
        }
      }
    `
    const queryResult = await server.executeOperation({
      query,
    })

    expect(queryResult.errors).toBeUndefined()
    expect(queryResult.data).toEqual({
      posts: [
        {
          id: '2',
          title: 'second post',
          published: false,
          author: {
            id: '1',
            name: 'user1',
          },
        },
        {
          id: '1',
          title: 'first post',
          published: false,
          author: {
            id: '1',
            name: 'user1',
          },
        },
      ],
    })
  })
})
describe('Post: Mutation', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        id: 1,
        name: 'user1',
        role: 'USER',
      },
    })
  })
  it('expect to create a post according to conditions', async () => {
    const query = `
      mutation {
        createPost (
          input: {
            title: "some post",
            published: true
          }
        ) {
          id
          title
          published
          author {
            id
            name
          }
        }
      }
    `
    const pubsub = new PubSub()
    const pubsubSpy = jest.spyOn(pubsub, 'publish')
    const queryResult = await server.executeOperation(
      {
        query,
      },
      {
        pubsub,
      },
    )

    expect(queryResult.errors).toBeUndefined()
    expect(queryResult.data).toEqual({
      createPost: {
        id: '1',
        title: 'some post',
        published: true,
        author: {
          id: '1',
          name: 'user1',
        },
      },
    })
    expect(pubsubSpy).toHaveBeenCalledTimes(1)
    expect(pubsubSpy).toHaveBeenCalledWith('POST_CREATED', {
      id: 1,
      title: 'some post',
      published: true,
      authorId: 1,
      author: {
        id: 1,
        email: null,
        name: 'user1',
        role: 'USER',
        createdAt: expect.any(Date),
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })
})
describe('User: Subscription', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        id: 1,
        name: 'user1',
        role: 'USER',
        posts: {
          create: {
            title: 'first post',
            published: true,
          },
        },
      },
    })
  })
  it('', async () => {
    const schema = pg.build()
    const pubsub = new PubSub()

    const subscription = `
    subscription postSubscription {
      postCreated {
        id
        title
        published
        author {
          id
          name
        }
      }
    }
  `
    const subscriptionResp = (await subscribe({
      schema,
      document: parse(subscription),
      contextValue: {
        prisma: prisma,
        pubsub,
      },
    })) as AsyncIterableIterator<ExecutionResult>

    setTimeout(() => {
      void pubsub.publish('POST_CREATED', {
        id: 1,
        published: true,
      })
    }, 100)

    const result = await (await subscriptionResp.next()).value
    expect(result).toEqual({
      data: {
        postCreated: {
          id: '1',
          title: 'first post',
          published: true,
          author: {
            id: '1',
            name: 'user1',
          },
        },
      },
    })
  })
})
