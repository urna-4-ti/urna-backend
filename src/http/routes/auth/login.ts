import { z } from "zod";
// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { deCrypt } from "../../../lib/crypto";

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

		const body = await request.body
		


		const data = loginBody.parse(body);

		const user = await prisma.user.findUnique({
			where: {
				email: data.email,
			},
		});

		const isMatch = user && (await deCrypt(data.password, user.password));
		if (!user || !isMatch) {
			return reply.code(401).send({
				message: "Invalid credentials",
			});
		}

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
