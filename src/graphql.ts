import { Prisma, PrismaClient, Role } from '@prisma/client'
import { getPGBuilder } from '@prismagql/prismagql'
import { ApolloServer } from 'apollo-server'
import { ApolloServerBase } from 'apollo-server-core'
import { PubSub } from 'graphql-subscriptions'
import { PGfyResponse } from './generated'
import { initClient } from './jest.setup'

export const pg = getPGBuilder<{ Context: Context; PGGeneratedType: PGfyResponse }>()()
export const pgDatamodel = pg.pgfy(Prisma.dmmf.datamodel)

interface UserAttributes {
  id: number | null
  email: string
  roles: Role[]
}

const prisma = initClient()
const pubsub = new PubSub()

export interface Context {
  user: UserAttributes
  prisma: PrismaClient
  pubsub: PubSub
}

export type ResolverSetupFn = () => void

export function initApolloServer(setupFns: ResolverSetupFn[]): ApolloServer {
  setupFns.map((x) => x())
  const schema = pg.build()
  return new ApolloServer({
    schema,
    context: async (params): Promise<Context> => {
      return {
        user: {
          id: 1,
          email: 'xxx@exapmple.com',
          roles: ['USER' as const],
        },
        prisma: prisma,
        pubsub: pubsub,
      }
    },
  })
}

export function initTestApolloServer(
  setupFns: ResolverSetupFn[],
): ApolloServerBase<Partial<Context>> {
  setupFns.map((x) => x())
  const schema = pg.build()
  return new ApolloServerBase<Partial<Context>>({
    schema,
    context: async (context): Promise<Context> => {
      return {
        user: { id: 1, email: 'xxx@exapmple.com', roles: ['USER' as const] },
        prisma: prisma,
        pubsub: pubsub,
        ...context,
      }
    },
  })
}
