import { prisma } from '@/lib/prisma'
import { getMonthRange } from '@/utils/date-utils'
import { UnauthorizedError } from './_errors/unauthorized-error'

interface GetExpensesByMonthUseCaseRequest {
  userId: string
  month: number
  year: number
}

interface GetExpensesByMonthUseCaseResponse {
  expenses: {
    userId: string
    id: string
    createdAt: Date
    title: string
    value: number
    service: string
  }[]
}

export class GetExpensesByMonthUseCase {
  async execute({
    month,
    userId,
    year,
  }: GetExpensesByMonthUseCaseRequest): Promise<GetExpensesByMonthUseCaseResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    const { start, end } = getMonthRange({ month, year })

    const expenses = await prisma.expense.findMany({
      select: {
        userId: true,
        id: true,
        title: true,
        service: true,
        value: true,
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { expenses }
  }
}
