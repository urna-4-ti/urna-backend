import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { parseBody } from "../../../utils/parseBody";
import { z } from "zod";
import { hash } from "bcrypt";
import { randomUUID } from "node:crypto";
import { decrypt, encrypt } from "../../../lib/crypto";

interface RouteParams {
  id: string;
}

export async function Vote(app: FastifyInstance) {
  app.post<{ Params: RouteParams }>("/vote/:id", async (req, reply) => {
    const bodySchema = z
      .object({
        userEnrollment: z.string(),
        politicalRegimeId: z.string().optional(),
        governmentId: z.string().optional(),
        candidateId: z.string().optional(),
        whiteVote: z.coerce.boolean().optional(),
      })
      .refine((data) => {
        const hasPoliticalRegimeId = data.politicalRegimeId;
        const hasGovernmentId = data.governmentId;
        const hasCandidateId = data.candidateId;
        const hasWhiteVote = data.whiteVote;

        if (
          !hasPoliticalRegimeId &&
          !hasGovernmentId &&
          !hasCandidateId &&
          !hasWhiteVote
        ) {
          return false;
        }
        return true;
      });

    const { id: electionId } = req.params;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const body: any = req.body;

    const fields = parseBody(body);

    try {
      const data = bodySchema.parse(fields);
      const enrollment = (data.userEnrollment)

      const voters = await prisma.user.findMany()
      const voter = voters.filter(async (voter) => (await decrypt(voter.enrollment) === data.userEnrollment))
      if (!voter) {
        return reply.status(403).send({
          message: 'no voter found',
          status: 403
        })
      }
      console.log(data, electionId);

      await prisma.vote.create({
        data: {
          ...data,
          class: voter[0].class,
          userEnrollment: await encrypt(data.userEnrollment, randomUUID()),
          electionId: electionId,
        },
      });

      return reply.status(201).send({
        message: "registered vote",
        status: 201,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(404).send({
          message: "Data in invalid format",
          status: 404,
          apiResponse: err.errors[0],
        });
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return reply.status(400).send({
          ...err,
          name: undefined,
          clientVersion: undefined,
          message: err.message,
          cause: err.cause,
          status: 400,
        });
      }
      if (err instanceof Prisma.PrismaClientValidationError) {
        console.log(err);
        return reply.status(404).send({
          ...err,
          name: undefined,
          clientVersion: undefined,
          cause: err.cause,
          message: err.message,
          status: 404,
        });
      }
      if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        console.log(err);
        return reply.status(404).send({
          ...err,
          name: undefined,
          clientVersion: undefined,
          cause: err.cause,
          message: err.message,
          status: 404,
        });
      }
      console.log(typeof err);
      console.log(err);

      return reply.status(400).send({
        error: err,
        message: "ocorreu um erro inesperado",
      });
    }
  });
}
