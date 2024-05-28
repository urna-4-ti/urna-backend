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
		};
		const bodyschema = z.object({
			cod: z.number(),
			name: z.string(),
		});
		const data = bodyschema.parse(fields);
		const { access_token } = req.cookies;

		const userJWTData: UserJWTPayload | null = app.jwt.decode(
			access_token as string,
		);

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
