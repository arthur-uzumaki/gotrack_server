import type { FastifyTypedInstance } from '@/@types/types'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import z from 'zod'

interface AuthUserGoogleUseCaseRequest {
  tokenId: string
}

interface AuthUserGoogleUseCaseResponse {
  accessToken: string
}

export class AuthUserGoogleUseCase {
  constructor(private readonly fastify: FastifyTypedInstance) {}

  async execute({
    tokenId,
  }: AuthUserGoogleUseCaseRequest): Promise<AuthUserGoogleUseCaseResponse> {
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenId}`,
        },
      }
    )

    const userData = await userResponse.data

    const userInfoSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      picture: z.string().url(),
    })

    const userInfo = userInfoSchema.parse(userData)

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        },
      })
    }

    const accessToken = this.fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
        email: user.email,
      },
      {
        sub: user.id,
        expiresIn: '7 days',
      }
    )

    return { accessToken }
  }
}
