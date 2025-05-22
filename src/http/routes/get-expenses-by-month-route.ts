import type { FastifyTypedInstance } from '@/@types/types'
import { authenticate } from '@/lib/authenticate'
import { GetExpensesByMonthUseCase } from '@/use-cases/get-expenses-by-month-use-case'
import z from 'zod'

export function getExpensesByMonthRoute(app: FastifyTypedInstance) {
  app.get(
    '/expenses',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Expense'],
        description: 'get list expenses by month',
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          month: z.coerce.number(),
          year: z.coerce.number(),
        }),
        response: {
          401: z.object({
            message: z.string().default('	Unauthorized'),
          }),
          200: z.object({
            expenses: z
              .object({
                userId: z.string().cuid(),
                id: z.string().cuid(),
                createdAt: z.date(),
                title: z.string(),
                value: z.number().positive(),
                service: z.string(),
              })
              .array(),
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

      const getExpensesByMonthUseCase = new GetExpensesByMonthUseCase()

      const result = await getExpensesByMonthUseCase.execute({
        userId,
        month,
        year,
      })

      const { expenses } = result

      return reply.status(200).send({ expenses })
    }
  )
}
