import { resolverSetupFns } from '.'
import { initApolloServer } from '../graphql'
import { prisma } from '../jest.setup'

const server = initApolloServer(resolverSetupFns)

describe('User: Query', () => {
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
        {
          title: 'post2',
          authorId: 1,
        },
      ],
    })
  })
  it('expect to return users according to conditions', async () => {
    const query = `
      query {
        users (where: { name: { contains: "user1" }, role: "USER" }) {
          id
          name
          role
          posts {
            title
          }
          latestPost {
            title
          }
        }
      }
    `
    const queryResult = await server.executeOperation({
      query,
    })

    expect(queryResult.errors).toBeUndefined()
    expect(queryResult.data).toEqual({
      users: [
        {
          id: '1',
          name: 'user1',
          role: 'USER',
          posts: [
            {
              title: 'post1',
            },
            {
              title: 'post2',
            },
          ],
          latestPost: {
            title: 'post2',
          },
        },
      ],
    })
  })
})
describe('User: Mutation', () => {
  it('expect to create a user according to conditions', async () => {
    const query = `
      mutation {
        createUser (
          input: {
            email: "yyy@example.com",
            name: "userY",
            role: ADMIN
          }
        ) {
          id
          name
          email
          role
        }
      }
    `
    const queryResult = await server.executeOperation({
      query,
    })

    expect(queryResult.errors).toBeUndefined()
    expect(queryResult.data).toEqual({
      createUser: { id: '1', name: 'userY', email: 'yyy@example.com', role: 'ADMIN' },
    })
  })
})
