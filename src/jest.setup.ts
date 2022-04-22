import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import { PrismaClient } from '@prisma/client'

export function initClient(databaseUrl = process.env.DATABASE_URL): PrismaClient {
  process.env.DATABASE_URL = databaseUrl
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
  return prisma
}

export async function resetDatabase(databaseUrl: string): Promise<{
  stdout: string
  stderr: string
}> {
  const promisifyExec = promisify(exec)
  const result = await promisifyExec(
    `DATABASE_URL="${databaseUrl}" && npx prisma migrate reset --force --skip-generate`,
  )
  return result
}

export async function queryAllTableNames(
  prisma: PrismaClient,
  schema: string,
): Promise<string[]> {
  const resp: Array<{ table_name: string }> = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables WHERE table_schema = ${schema} AND table_name NOT LIKE '\\_%';
  `
  return resp.map((x) => `"${x.table_name}"`)
}

export function getTestDatabaseUrl(): string {
  const defaultDatabaseUrl = process.env.DATABASE_URL
  if (defaultDatabaseUrl === undefined) {
    throw new Error('invalid process.env.DATABASE_URL')
  }
  const urlWithoutSchema = defaultDatabaseUrl.split('?')[0]
  return `${urlWithoutSchema}?schema=test`
}

export async function truncateAllTables(
  prisma: PrismaClient,
  schema: string,
): Promise<void> {
  const tableNames = (await queryAllTableNames(prisma, schema)).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`)
}

export const prisma = initClient(getTestDatabaseUrl())

function getTestDbInitFlagFilePath(executeId: string): string {
  return `/tmp/.jest-db-init-flag-${executeId}`
}

export async function initTestDb(
  executeId = (global as any).executeId as string,
): Promise<void> {
  const dbInitFlagFilePath = getTestDbInitFlagFilePath(executeId)
  const isTestDbInited = fs.existsSync(dbInitFlagFilePath)
  if (!isTestDbInited) {
    await resetDatabase(getTestDatabaseUrl())
    fs.closeSync(fs.openSync(dbInitFlagFilePath, 'w'))
  }
  await prisma.$connect()
}

beforeAll(async () => {
  await initTestDb()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await truncateAllTables(prisma, 'test')
})

afterEach(() => {
  jest.clearAllMocks()
})
