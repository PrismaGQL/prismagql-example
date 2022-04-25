import { setupPostResolver } from './post-resolver'
import { setupUserResolver } from './user-resolvers'
import { setupMetricsResolver } from './metrics-resolver'

export const resolverSetupFns = [
  setupUserResolver,
  setupPostResolver,
  setupMetricsResolver,
]
