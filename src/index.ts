import { initApolloServer } from './graphql'
import { resolverSetupFns } from './resolvers'

export const server = initApolloServer(resolverSetupFns)

server.listen(3000).finally(() => {
  console.log('server start')
})
