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
		});
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = req.body;

		const fields = {
			cod: Number(body.cod.value),
			name: body.name.value,
		};
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
