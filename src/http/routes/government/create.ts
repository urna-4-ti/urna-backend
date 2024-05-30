// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";

export async function CreateGovernmentForm(app: FastifyInstance) {
	app.post("/government/form", async (req, reply) => {
		const bodyschema = z.object({
			cod: z.number(),
			name: z.string(),
			description: z.string(),
		});
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = req.body;

		const fields = {
			cod: Number(body.cod.value),
			name: body.name.value,
			description: body.description.value,
		};
		const data = bodyschema.parse(fields);
		let userJWTData: UserJWTPayload | null = null;
		try {
			const authorization = req.headers.authorization;
			const access_token = authorization?.split("Bearer ")[1];
			userJWTData = app.jwt.decode(access_token as string);
		} catch (error) {
			return reply.status(403).send({
				error: error,
				message: "Token Missing",
			});
		}

		const loggedUser = await prisma.user.findUnique({
			where: {
				email: userJWTData?.email,
			},
		});

		console.log(loggedUser);

		if (loggedUser?.role !== "ADMIN") {
			return reply.status(403).send({
				message: "Action not permitted",
			});
		}

		try {
			await prisma.politicalType.create({
				data: {
					name: data.name,
					cod: data.cod,
					description: data.description,
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
