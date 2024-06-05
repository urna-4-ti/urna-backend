import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { parseBody } from "../../../utils/parseBody";

import { z, ZodError } from "zod";

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
			})
			.refine((data) => {
				const hasPoliticalRegimeId = data.politicalRegimeId;
				const hasGovernmentId = data.governmentId;
				const hasCandidateId = data.candidateId;

				if (!hasPoliticalRegimeId && !hasGovernmentId && !hasCandidateId) {
					return false;
				}
				return true;
			});

		const { id: votingId } = req.params;

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = req.body;

		const fields = parseBody(body);
		console.log(fields);

		try {
			const data = bodySchema.parse(fields);
			const voter = await prisma.user.findUniqueOrThrow({
				where: {
					enrollment: data.userEnrollment,
				},
				select: {
					class: true,
				},
			});
			await prisma.user;

			await prisma.vote.create({
				data: {
					...data,
					class: voter.class,
					userEnrollment: data.userEnrollment,
					votingId,
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

			return reply.status(400).send({
				error: err,
				message: "ocorreu um erro inesperado",
			});
		}
	});
}
