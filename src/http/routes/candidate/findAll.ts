import { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import { UserJWTPayload } from "src/utils/types";

export  async function getCandidate (app: FastifyInstance) {
  app.get("/candidate", async (req, reply) => {
    const { access_token } = req.cookies

    const userJWTData: UserJWTPayload | null = app.jwt.decode(
      access_token as string,
    )

    const loggedUser = await prisma.user.findUnique({
      where: {
        email: userJWTData?.email,
      }
    })

    if(loggedUser?.role !== "ADMIN") {
      return reply.status(403).send({
        nessage: "Action not permitted",
      })
    }

    try{
      const candidateForm = await prisma.candidate.findMany()

      return reply.status(200).send({
        data: candidateForm,
      })
    } catch (error) {
      return reply.status(401).send({
        msg: "An error occuried",
        error: error,
      })
    }
  })
}