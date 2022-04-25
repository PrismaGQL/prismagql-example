import { pg, pgDatamodel } from '../graphql'

export const post = pg.objectFromModel(pgDatamodel.models.Post, (reuse, f) => reuse)
