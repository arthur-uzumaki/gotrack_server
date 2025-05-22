import { prisma } from '@/lib/prisma'
import { UnauthorizedError } from './_errors/unauthorized-error'

interface CreateExpenseUseCaseRequest {
  userId: string
  title: string
  value: number
  service: string
}

interface CreateExpenseUseCaseResponse {
  expenseId: string
}

export class CreateExpenseUseCase {
  async execute({
    service,
    title,
    userId,
    value,
  }: CreateExpenseUseCaseRequest): Promise<CreateExpenseUseCaseResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        title,
        service,
        value,
      },
    })

    return { expenseId: expense.id }
  }
}
