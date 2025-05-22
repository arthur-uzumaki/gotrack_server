import type { FastifyTypedInstance } from '@/@types/types'
import { authenticate } from '@/lib/authenticate'
import { CreateExpenseUseCase } from '@/use-cases/create-expense-use-case'
import z from 'zod'

export function createExpenseRoute(app: FastifyTypedInstance) {
  app.post(
    '/expenses',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Expense'],
        description: 'create expense',
        security: [{ bearerAuth: [] }],
        body: z.object({
          title: z.string().min(4, 'At least 4 characters'),
          value: z.number().positive().min(1, 'At least 1 characters'),
          service: z.string().min(2, 'At least 2 characters'),
        }),
        response: {
          201: z.object({
            expenseId: z.string().cuid2(),
          }),
          401: z.object({
            message: z.string().default('	Unauthorized'),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub
      const { service, title, value } = request.body

      if (!userId) {
        return reply.status(401).send({ message: '	Unauthorized' })
      }

      const expenseCreateUseCase = new CreateExpenseUseCase()

      const result = await expenseCreateUseCase.execute({
        service,
        title,
        userId,
        value,
      })

      const { expenseId } = result

      return reply.status(201).send({ expenseId })
    }
  )
}
