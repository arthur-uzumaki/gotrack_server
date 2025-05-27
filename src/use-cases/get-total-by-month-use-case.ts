import { prisma } from '@/lib/prisma'
import { getMonthRange } from '@/utils/date-utils'
import { UnauthorizedError } from './_errors/unauthorized-error'

interface GetExpensesByMonthUseCaseRequest {
  userId: string
  month: number
  year: number
}

interface GetTotalByMonthUseCaseResponse {
  total: number
}

export class GetTotalByMonthUseCase {
  async execute({
    month,
    userId,
    year,
  }: GetExpensesByMonthUseCaseRequest): Promise<GetTotalByMonthUseCaseResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    const { end, start } = getMonthRange({ month, year })

    const total = await prisma.expense.aggregate({
      _sum: {
        value: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    })

    return { total: total._sum.value ?? 0 }
  }
}
