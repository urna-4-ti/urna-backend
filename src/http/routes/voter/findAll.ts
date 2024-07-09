import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "../../../lib/crypto";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
import type { User } from "@prisma/client";

export async function getAllVoters(app: FastifyInstance) {
	app.get("/voter", async (req: FastifyRequest, reply: FastifyReply) => {
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
			const dbData = await prisma.user.findMany({
				where: {
					role: "VOTER",
				},
				select: {
					id: true,
					class: true,
					email: true,
					enrollment: true,
					name: true,
				},
			});

			const classVoters = await Promise.all(
				dbData.map(async (item) => {
					item.enrollment = await decrypt(item.enrollment);
					item.name = await decrypt(item.name);

					return item;
				}),
			);

			console.log(classVoters);

			return reply.status(200).send({
				data: classVoters,
			});
		} catch (error) {
			return reply.status(401).send({
				msg: "An error occurred",
				error: error,
			});
		}
	});
}

// FN SOMENTE PEGANDO O ID
interface RouteParams {
	enrollment: string;
	electionId: string;
}

export async function getVoterId(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>(
		"/voter/:id/:electionId",
		async (req, reply) => {
			const { electionId, enrollment } = req.params;

			try {
				const user = await prisma.user.findUniqueOrThrow({
					where: {
						enrollment,
					},
				});
				if (electionId) {
					const UserHasVoted = await prisma.vote.findUnique({
						where: {
							electionId: electionId,
							userEnrollment: enrollment,
						},
					});

					if (UserHasVoted) {
						return reply.status(403).send({
							message: "this user already voted in this election!",
						});
					}
				}

				const UserDecrypted = async () => {
					user.enrollment = await decrypt(user.enrollment);
					user.name = await decrypt(user.name);
					return user;
				};

				const decryptedUdser = await UserDecrypted();

				return reply.status(200).send({
					data: decryptedUdser,
				});
			} catch (error) {
				return reply.status(401).send({
					msg: "An error occurred",
					error: error,
				});
			}
		},
	);
}
