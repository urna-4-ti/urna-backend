import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { FastifyInstance } from "fastify";
import { encrypt, hashing } from "src/lib/crypto";

interface RouteParams {
	id: string;
}

export async function EditVoter(app: FastifyInstance) {
	app.patch<{ Params: RouteParams }>("/voter/:id", async (request, reply) => {
		const loginBody = z.object({
			name: z.string(),
			email: z.string().email("The field is not email"),
			password: z
				.string()
				.min(10, "The password must be 10 characters")
				.max(10, "The password must be 10 characters"),
			role: z.enum(["VOTER"]),
			enrollment: z.string(),
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
				"ADMIN",
			]),
		});
		const { id } = request.params;

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = request.body;

		const fields = {
			email: body.email.value,
			password: body.enrollment.value,
			name: body.name.value,
			class: body.class.value,
			role: body.role.value,
			enrollment: body.enrollment.value,
		};

		console.log(fields.email);

		try {
			const data = loginBody.parse(fields);

			const cryptoPassword = await encrypt(data.password);
			const hashPassword = await hashing(data.password);
			const cryptoName = await encrypt(data.name);
			const cryptoEnrollment = await encrypt(data.enrollment);
			const updatedVoter = await prisma.user.update({
				where: { id },
				data: {
					email: data.email,
					name: cryptoName,
					password: cryptoPassword,
					hashPassword: hashPassword,
					class: data.class,
					enrollment: cryptoEnrollment,
					role: data.role,
				},
			});
			return reply.status(200).send({
				data: updatedVoter,
			});

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error(err);
			return reply.status(404).send({
				message: err.message,
				code: err.code,
				errorName: err.name,
				error: err,
			});
		}
	});
}
