import { env } from '@/env/env'
import { fastifyCors } from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

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

app.listen({ port: env.PORT, host: '0.0.0.0' }, () => {
  console.log('Running server http://localhost:3333')
})
