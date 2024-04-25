import type { Classes } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

interface RouteParams {
	class: Classes;
}

export async function getAllVoters(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/voter/:class", async (req, reply) => {
		const { class: voterClass } = req.params;
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
			const classVoters = await prisma.user.findMany({
				where: {
					class: voterClass,
				},
			});

			return reply.status(200).send({
				data: classVoters,
			});
		} catch (error) {
			return reply.status(401).send({
				msg: "An error occuried",
				error: error,
			});
		}
	});
}
