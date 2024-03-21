import { z } from "zod";
import { FastifyInstance } from "fastify";

export async function login(app: FastifyInstance) {
	app.post("/polls", async (request, reply) => {
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

		const body = loginBody.parse(request.body);
	});
}
