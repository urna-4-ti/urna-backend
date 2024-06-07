import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";

interface RouteParams {
	id: string;
}

export async function DeleteGovernment(app: FastifyInstance) {
	app.delete<{ Params: RouteParams }>(
		"/government/form/:id",
		async (req, reply) => {
			const { id } = req.params;
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
				await prisma.politicalType.delete({
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
		},
	);
}
