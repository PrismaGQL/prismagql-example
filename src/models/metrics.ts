import { pg } from '../graphql'

export const metrics = pg.object('Metrics', (f) => ({
  userCount: f.int(),
  postCount: f.int(),
}))

pg.resolver(metrics, {
  userCount: async (params) => await params.context.prisma.user.count(),
  postCount: async (params) => await params.context.prisma.post.count(),
})
