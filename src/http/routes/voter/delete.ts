import type { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

interface RouteParams {
	id: string;
}

export async function DeleteVoter(app: FastifyInstance) {
	app.delete<{ Params: RouteParams }>("/voter/:id", async (req, reply) => {
		let userJWTData: UserJWTPayload | null = null;
		const { id } = req.params;
		try {
			const { access_token } = req.cookies;
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
			await prisma.user.delete({
				where: { id },
			});
			return reply.status(204).send();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(403).send({
				error: err,
				message: err.message,
			});
		}
	});
}
