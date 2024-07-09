// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";

export async function GetPoliticalRegime(app: FastifyInstance) {
	app.get("/politicalRegime", async (req, reply) => {
		let userJWTData: UserJWTPayload | null = null;
		try {
			const authorization = req.headers.authorization;
			const access_token = authorization?.split("Bearer ")[1];
			userJWTData = app.jwt.decode(access_token as string);
		} catch (error) {
			return reply.status(403).send({
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
			const politicalRegime = await prisma.politicalRegime.findMany();
			return reply.status(201).send({ data: politicalRegime });
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(403).send({
				message: err.message,
				statusCode: 403,
			});
		}
	});
}
