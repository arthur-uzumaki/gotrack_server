import type { FastifyTypedInstance } from '@/@types/types'
import { authenticate } from '@/lib/authenticate'
import { GetTotalByMonthUseCase } from '@/use-cases/get-total-by-month-use-case'
import z from 'zod'

export async function getTotalByMonthRoute(app: FastifyTypedInstance) {
  app.get(
    '/expenses/total-by-month',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Expense'],
        description: 'Get total expenses by month',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          month: z.coerce.number(),
          year: z.coerce.number(),
        }),
        response: {
          401: z.object({
            message: z.string().default('Unauthorized'),
          }),
          200: z.object({
            total: z.number().positive(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub
      const { month, year } = request.query

      if (!userId) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const getTotalByMonthUseCase = new GetTotalByMonthUseCase()

      const result = await getTotalByMonthUseCase.execute({
        userId,
        month,
        year,
      })

      const { total } = result

      return reply.status(200).send({ total })
    }
  )
}
