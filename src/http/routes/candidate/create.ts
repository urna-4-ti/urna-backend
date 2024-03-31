// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

export async function CreateCandidate(app: FastifyInstance) {
	app.post("/candidate", async (req, reply) => {
		const bodyschema = z.object({
			cod: z.number(),
			name: z.string(),
			picPath: z.string(),
			politicalPartyId: z.string(),
			description: z.string(),
		});
		const data = bodyschema.parse(req.body);

		try {
			await prisma.candidate.create({
				data: {
					...data,
				},
			});
			return reply.status(201).send();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(403).send({
				message: err.message,
				statusCode: 403,
			});
		}
	});
}
