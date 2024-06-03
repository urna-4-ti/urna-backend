// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";

interface RouteParams {
	id: string;
}

export async function EditGovernment(app: FastifyInstance) {
	app.patch<{
		Params: RouteParams;
	}>("/government/form/:id", async (req, reply) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = await req.body;
		const { id } = req.params;
		const fields = {
			cod: Number(body.cod.value),
			name: body.name.value,
			description: body.description.value,
		};
		const bodyschema = z.object({
			cod: z.number(),
			name: z.string(),
			description: z.string(),
		});
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

		if (loggedUser?.role !== "ADMIN") {
			return reply.status(403).send({
				message: "Action not permitted",
			});
		}

		try {
			await prisma.politicalType.update({
				where: {
					id,
				},
				data: {
					cod: data.cod,
					name: data.name,
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
