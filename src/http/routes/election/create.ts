import { Classes, Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { parseBody } from "../../../utils/parseBody";
import type { UserJWTPayload } from "../../../utils/types";
import { z } from "zod";

export async function CreateElection(app: FastifyInstance) {
  app.post("/election", async (req, reply) => {
    let userJWTData: UserJWTPayload | null = null;
    try {
      const authorization = req.headers.authorization;
      const access_token = authorization?.split("Bearer ")[1];
      userJWTData = app.jwt.decode(access_token as string);
    } catch (error) {
      return reply.status(403).send({
        error: error,
        message: "Missing Token",
      });
    }

    const loggedUser = await prisma.user.findFirst({
      where: {
        email: userJWTData?.email,
      },
    });

    if (loggedUser?.role !== "ADMIN") {
      return reply.status(403).send({
        message: "Action not permitted",
      });
    }

    const bodySchema = z
      .object({
        name: z.string(),
        class: z.enum([
          "TI_1",
          "TI_2",
          "TI_3",
          "TI_4",
          "TQ_1",
          "TQ_2",
          "TQ_3",
          "TQ_4",
          "TMA_1",
          "TMA_2",
          "TMA_3",
          "TMA_4",
          "TA_1",
          "TA_2",
          "TA_3",
          "TA_4",
        ]),
        candidates: z.string().array().optional(),
        politicalRegimes: z.string().array().optional(),
        governmentSystems: z.string().array().optional(),
      })
      .refine((data) => {
        const hasPoliticalRegime = data.politicalRegimes;
        const hasGovernment = data.governmentSystems;
        const hasCandidate = data.candidates;

        if (!hasCandidate && !hasGovernment && !hasPoliticalRegime) {
          return false;
        }
        return true;
      });

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const body: any = req.body;

    const fields = parseBody(body);
    console.log('fields', fields);

    try {
      const zBody = bodySchema.parse(fields);
      console.log('parsed ', zBody);

      if (zBody) {

        const election = await prisma.election.create({
          data: {
            name: zBody.name,
            class: zBody.class,
            status: 'CREATED',
          },
        });
        await prisma.election.update({
          where: { id: election.id },
          data: {
            candidates: {
              connect: zBody.candidates?.map((id) => ({ id }))
            },
            politicalRegimes: {
              connect: zBody.politicalRegimes?.map(id => ({ id }))
            },
            governmentSystem: {
              connect: zBody.governmentSystems?.map(id => ({ id }))
            }
          }
        })


      }
      console.log('created');

      return reply.status(201).send({
        message: "voting created!",
        status: 201,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(404).send({
          message: "Data in invalid format",
          status: 404,
          apiResponse: error.errors[0],
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return reply.status(404).send({
          ...error,
        });
      }
    }
  });
}
