import { env } from '@/env/env'
import { fastifyCors } from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import fastify from 'fastify'

import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { authUserGoogleRoute } from './routes/auth-user-google-route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: '*',
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'go track',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(authUserGoogleRoute)

app.listen({ port: env.PORT, host: '0.0.0.0' }, () => {
  console.log('Running server http://localhost:3333')
})

app.ready().then(() => {
  const spec = app.swagger()

  writeFile(
    resolve(process.cwd(), 'swagger.json'),
    JSON.stringify(spec, null, 2),
    'utf-8'
  )
})
