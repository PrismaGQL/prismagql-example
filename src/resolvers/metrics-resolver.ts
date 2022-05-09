import { pg, ResolverSetupFn } from '../graphql'
import { metrics } from '../models/metrics'

export const setupMetricsResolver: ResolverSetupFn = () => {
  pg.query('metrics', (f) => f.object(() => metrics).resolve((params) => ({})))
}
