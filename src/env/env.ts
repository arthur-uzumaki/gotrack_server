import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  PORT: z.coerce.number().positive().int().default(3333),
  JWT_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)
