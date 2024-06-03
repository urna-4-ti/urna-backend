// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
import type { Classes } from "@prisma/client";

interface RouteParams {
	class: Classes;
}

interface RouteParamsId {
	id: string;
}

export async function FindClassPoliticalParty(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/political/:class", async (req, reply) => {
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
			const politicalPartys = await prisma.politicalParty.findMany({
				// where: {
				// 	class: CandidateClass,
				// },
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

export async function FindIdPoliticalParty(app: FastifyInstance) {
	app.get<{ Params: RouteParamsId }>(
		"/political/unique/:id",
		async (req, reply) => {
			const { access_token } = req.cookies;
			const { id: PoliticalId } = req.params;

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
				const politicalPartys = await prisma.politicalParty.findUniqueOrThrow({
					where: {
						id: PoliticalId,
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
		},
	);
}

export async function FindAllPoliticalParty(app: FastifyInstance) {
	app.get("/political", async (req, reply) => {
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
			const politicalPartys = await prisma.politicalParty.findMany({
				include: {
					politicalType: {
						select: {
							name: true,
						},
					},
				},
			});
			return reply.status(201).send({
				data: politicalPartys,
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
