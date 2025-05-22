interface GetMonthRangeProps {
  month: number
  year: number
}

export function getMonthRange({ month, year }: GetMonthRangeProps) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  return { start, end }
}
