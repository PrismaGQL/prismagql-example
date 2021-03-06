import { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime'
import { PGEnum, PGField, PGModel } from '@prismagql/prismagql/lib/types/common'

type RoleValuesType = ['USER', 'ADMIN']
type UserFieldMapType = {
  id: PGField<number>
  createdAt: PGField<Date>
  email: PGField<string | null>
  name: PGField<string>
  role: PGField<PGEnum<RoleValuesType>>
  posts: PGField<Array<PGModel<PostFieldMapType>>>
}
type PostFieldMapType = {
  id: PGField<number>
  createdAt: PGField<Date>
  updatedAt: PGField<Date>
  published: PGField<boolean>
  title: PGField<string>
  author: PGField<PGModel<UserFieldMapType>>
  authorId: PGField<number>
}
type PGfyResponseEnums = {
  Role: PGEnum<RoleValuesType>
}
type PGfyResponseModels = {
  User: PGModel<UserFieldMapType, Prisma.UserWhereInput>
  Post: PGModel<PostFieldMapType, Prisma.PostWhereInput>
}

export interface PGfyResponse {
  enums: PGfyResponseEnums
  models: PGfyResponseModels
}
