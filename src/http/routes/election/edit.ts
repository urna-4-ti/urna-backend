import { Classes, electionStatus, Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { parseBody } from "../../../utils/parseBody";
import type { UserJWTPayload } from "../../../utils/types";
import { z } from "zod";

interface RouteParams {
  id:string
}

export async function EditElection(app: FastifyInstance) {
	app.patch<{Params:RouteParams}>("/election/:id", async (req, reply) => {
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

		const loggedUser = await prisma.user.findUnique({
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
				name: z.string().optional(),
        status: z.enum(['CREATED','IN_PROGRESS','DONE']).optional()
			})

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = req.body;

		const fields = parseBody(body);
      const {id} = req.params
		try {
			const data = bodySchema.parse(fields);
      if(data){
        await prisma.election.update({
          where:{
            id
          },
          data:{...data}
        })
      }
			

			return reply.status(200).send({
				message: "voting edited",
				status: 200,
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
