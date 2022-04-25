import { Prisma } from '@prisma/client'
import { pg, pgDatamodel } from '../graphql'
import { post } from './post'

export const user = pg.objectFromModel(pgDatamodel.models.User, (reuse, f) => ({
  ...reuse,
  latestPost: f.object(() => post).nullable(),
}))

pg.resolver(user, {
  latestPost: (params) => {
    return pg.dataloader(params, async (sourceList) => {
      const findArgs = pg.prismaFindArgs<Prisma.PostFindManyArgs>(post, params)
      const users = await params.context.prisma.user.findMany({
        where: {
          id: {
            in: sourceList.map((x) => x.id),
          },
        },
        include: {
          posts: {
            ...findArgs,
            take: 1,
            orderBy: {
              id: 'desc',
            },
          },
        },
      })
      return sourceList.map(
        (x) => users.find((user) => user.id === x.id)?.posts[0] ?? null,
      )
    })
  },
})
