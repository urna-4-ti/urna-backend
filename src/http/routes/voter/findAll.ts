import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt, encrypt } from "../../../lib/crypto";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
import { Prisma, type User } from "@prisma/client";

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
				const user = await prisma.user.findFirst({
					where: {
						enrollment: enrollment,
					},
				});
				console.log(user);
				if (user) {
					if (electionId) {
						const UserHasVoted = await prisma.vote.findFirst({
							where: {
								userEnrollment: enrollment,
								electionId: electionId,
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

					const decryptedUser = await UserDecrypted();

					return reply.status(200).send({
						data: decryptedUser,
					});
				}
				return reply.status(401).send({
					message: "voter not found",
				});
			} catch (error) {
				console.error(error);
				return reply.status(500).send({
					msg: "An error occurred",
					error: error,
				});
			}
		},
	);
}
