import { Classes, Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { parseBody } from "../../../utils/parseBody";
import type { UserJWTPayload } from "../../../utils/types";
import { z } from "zod";

export async function CreateVoting(app: FastifyInstance) {
	app.post("/voting", async (req, reply) => {
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

		const bodySchema = z.object({
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
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = req.body;
		const fields = parseBody(body);

		try {
			const data = bodySchema.parse(fields);
			if (data) {
				await prisma.voting.create({
					data,
				});
			}

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
