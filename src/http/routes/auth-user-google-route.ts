import type { FastifyTypedInstance } from '@/@types/types'
import { AuthUserGoogleUseCase } from '@/use-cases/auth-user-google-use-case'
import z from 'zod'

export function authUserGoogleRoute(app: FastifyTypedInstance) {
  app.post(
    '/sessions',
    {
      schema: {
        tags: ['User'],
        description: 'Authenticate user google',
        body: z.object({
          tokenId: z.string(),
        }),
        response: {
          201: z.object({
            accessToken: z.string().jwt(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { tokenId } = request.body

      const authUserGoogleUseCase = new AuthUserGoogleUseCase(app)

      const result = await authUserGoogleUseCase.execute({ tokenId })

      const { accessToken } = result

      return reply.status(201).send({ accessToken })
    }
  )
}
