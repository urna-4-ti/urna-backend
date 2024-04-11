// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { type UserJWTPayload } from "../../../utils/types";
import type { Classes } from "@prisma/client";

interface RouteParams {
	class: Classes;
}

export async function FindAllPoliticalParty(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/political/:class", async (req, reply) => {
		const { access_token } = req.cookies;
		const { class: CandidateClass } = req.params;


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
			const politicalPartys = await prisma.politicalParty.findMany({
				where: {
					class: CandidateClass,
				},
			});
			return reply.status(201).send({
				politicalPartys: politicalPartys,
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(403).send({
				message: err.message,
				statusCode: 403,
			});
		}
	});
}
