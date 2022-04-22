import { Prisma } from '@prisma/client'
import { pg, pgDatamodel, ResolverSetupFn } from '../graphql'
import { post } from '../models/post'

export const setupPostResolver: ResolverSetupFn = () => {
  const findPostManyArgs = pg.queryArgsBuilder<Prisma.PostFindManyArgs>('FindPostMany')({
    where: {
      authorId: 'Int',
    },
    orderBy: {
      id: 'String',
    },
  })

  pg.query('posts', (f) =>
    f
      .object(() => post)
      .list()
      .args(() => findPostManyArgs)
      .resolve(async (params) => {
        const findArgs = pg.prismaFindArgs<Prisma.PostFindManyArgs>(post, params)
        return await params.context.prisma.post.findMany(findArgs)
      }),
  )

  const createPostInput = pg.inputFromModel(
    'CreatePostInput',
    pgDatamodel.models.Post,
    (reuse, f) => ({
      title: reuse.title.validation((z) => z.string().max(255)),
      published: reuse.published,
    }),
  )

  pg.mutation('createPost', (f) =>
    f
      .object(() => post)
      .args((f) => ({
        input: f.input(() => createPostInput),
      }))
      .auth(({ ctx }) => ctx.user.id !== null)
      .resolve(async (params) => {
        const createArgs = pg.prismaFindArgs<Prisma.PostCreateArgs>(post, params)
        const createdPost = await params.context.prisma.post.create({
          ...createArgs,
          data: {
            ...params.args.input,
            authorId: params.context.user.id!,
          },
        })
        params.context.pubsub.publish('POST_CREATED', createdPost)
        return createdPost
      }),
  )

  pg.subscription('postCreated', (f) =>
    f
      .object(() => post)
      .subscribe((params) => ({
        pubSubIter: params.context.pubsub.asyncIterator('POST_CREATED'),
        filter: () => params.source.published,
      }))
      .resolve(async (params) => {
        const findArgs = pg.prismaFindArgs<Prisma.PostFindUniqueArgs>(post, params)
        return await params.context.prisma.post.findUnique({
          ...findArgs,
          where: {
            id: params.source.id,
          },
          rejectOnNotFound: true,
        })
      }),
  )
}
