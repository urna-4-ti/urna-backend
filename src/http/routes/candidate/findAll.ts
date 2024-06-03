// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";

export async function FindAllCandidates(app: FastifyInstance) {
	app.get("/candidate", async (req, reply) => {
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
			const candidates = await prisma.candidate.findMany({
				include: {
					PoliticalParty: {
						select: {
							class: true,
						},
					},
				},
			});
			return reply.status(201).send({
				data: candidates,
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

interface RouteParams {
	id: string;
}

export async function FindCandidatesId(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/candidate/:id", async (req, reply) => {
		const { access_token } = req.cookies;
		const { id: CandidateId } = req.params;

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
			const candidate = await prisma.candidate.findUniqueOrThrow({
				where: {
					id: CandidateId,
				},
				include: {
					PoliticalParty: {
						select: {
							class: true,
						},
					},
				},
			});
			return reply.status(201).send({
				data: candidate,
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
