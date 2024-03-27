import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { enCrypt } from "../../../lib/crypto";
import { prisma } from "../../../lib/prisma";
import { Roles } from "@prisma/client";

export async function signUp(app: FastifyInstance) {
	app.post("/auth/signUp", async (request, reply) => {
		const loginBody = z.object({
			name: z.string(),
			email: z.string().email("The field is not email"),
			password: z
				.string()
				.min(6, "The password must be 6 characters or longer")
				.refine(
					(password) => /[A-Z]/.test(password),
					"The password must contain at least one capital letter",
				)
				.refine(
					(password) => /[0-9]/.test(password),
					"The password must contain at least one number",
				)
				.refine(
					(password) => /[#-@]/.test(password),
					"The password must contain at least one of the special characters: #, -, @",
				),
			role: z.enum(["ADMIN", "VOTER"]),
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

		console.log(request.body);

		const body = loginBody.parse(request.body);

		const cryptoPassword = await enCrypt(body.password);
		const cryptoName = await enCrypt(body.name);
		const cryptoEnrollment = await enCrypt(body.enrollment);
		if (body.role === Roles.ADMIN) {
			return reply
				.status(400)
				.send({ message: "You cant assing ADMIN role to your account" });
		}

		try {
			await prisma.user.create({
				data: {
					email: body.email,
					name: cryptoName,
					password: cryptoPassword,
					class: body.class,
					enrollment: cryptoEnrollment,
					role: body.role,
				},
			});
			console.log("success");

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(404).send({
				message: "An error ocurried",
				code: err.code,
				errorName: err.name,
			});
		}

		return reply.status(201).send("ok");
	});
}
