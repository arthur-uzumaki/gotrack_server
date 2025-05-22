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
import { createExpenseRoute } from './routes/create-expense-route'
import { getExpensesByMonthRoute } from './routes/get-expenses-by-month-route'

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
              tokenUrl: 'https://oauth2.googleapis.com/token',
              scopes: {
                openid: 'OpenID Connect scope',
                email: 'Access to your email address',
                profile: 'Access to your basic profile info',
              },
            },
          },
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(authUserGoogleRoute)
app.register(createExpenseRoute)
app.register(getExpensesByMonthRoute)

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
