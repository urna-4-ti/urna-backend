import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";

export async function FindAllVotings(app: FastifyInstance) {
	app.get("/voting", async (req, reply) => {
		let userJWTData: UserJWTPayload | null = null;
		try {
			const authorization = req.headers.authorization;
			const access_token = authorization?.split("Bearer ")[1];
			userJWTData = app.jwt.decode(access_token as string);
		} catch (error) {
			return reply.status(403).send({
				error: error,
				message: "Missing Token",
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
			const votings = await prisma.voting.findMany();
			return reply.send({
				votings,
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				return reply.status(404).send({
					...err,
					status: 404,
				});
			}
		}
	});
}
