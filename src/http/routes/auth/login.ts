import { z } from "zod";
// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { compareHash, decrypt } from "../../../lib/crypto";
import type { User } from "@prisma/client";

export async function signIn(app: FastifyInstance) {
	app.post("/auth/signIn", async (request, reply) => {
		const loginBody = z.object({
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
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = request.body;
		const fields = {
			email: body.email.value,
			password: body.password.value,
		};

		const data = loginBody.parse(fields);
		let user: User | null;
		try {
			user = await prisma.user.findUniqueOrThrow({
				where: {
					email: data.email,
				},
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			console.error(error.message);
			return reply.status(403).send({
				error: error,
				message: "User Not found",
			});
		}

		const isMatch =
			user && (await compareHash(data.password, user.hashPassword));
		if (!user || !isMatch) {
			return reply.code(401).send({
				message: "Invalid credentials",
			});
		}

		user.name = await decrypt(user.name);
		const payload = {
			id: user.id,
			email: user.email,
			name: user.name,
		};

		const token = request.jwt.sign(payload);
		reply.setCookie("access_token", token, {
			path: "/",
			httpOnly: true,
			secure: true,
		});
		return { accessToken: token };
	});
}
