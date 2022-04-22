import { Prisma } from '@prisma/client'
import { pg, pgDatamodel, ResolverSetupFn } from '../graphql'
import { user } from '../models/user'

export const setupUserResolver: ResolverSetupFn = () => {
  const findUserManyArgs = pg.queryArgsBuilder<Prisma.UserFindManyArgs>('FindUserMany')({
    where: {
      name: {
        contains: 'String',
      },
      role: 'String',
    },
  })

  pg.query('users', (f) =>
    f
      .object(() => user)
      .list()
      .args(() => findUserManyArgs)
      .resolve(async (params) => {
        const findArgs = pg.prismaFindArgs<Prisma.UserFindManyArgs>(user, params)
        return await params.context.prisma.user.findMany(findArgs)
      }),
  )

  const createUserInput = pg.inputFromModel(
    'CreateUserInput',
    pgDatamodel.models.User,
    (reuse, f) => ({
      email: reuse.email,
      name: reuse.name.default('anonymous'),
      role: reuse.role.default('USER'),
    }),
  )

  pg.mutation('createUser', (f) =>
    f
      .object(() => user)
      .args((f) => ({
        input: f.input(() => createUserInput),
      }))
      .resolve(async (params) => {
        const createArgs = pg.prismaFindArgs<Prisma.UserCreateArgs>(user, params)
        return await params.context.prisma.user.create({
          ...createArgs,
          data: {
            ...params.args.input,
          },
        })
      }),
  )
}
