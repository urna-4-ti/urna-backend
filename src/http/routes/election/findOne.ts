import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
interface RouteParams {
	id: string;
}

export async function FindOneElection(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/election/:id", async (req, reply) => {
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

		const { id } = req.params;

		try {
			const [voting, allVotes] = await prisma.$transaction([
				prisma.election.findUniqueOrThrow({
					where: {
						id,
					},
				}),
				prisma.vote.findMany({
					distinct: ["candidateId", "governmentId", "politicalRegimeId"],
					select: {
						candidateVote: {
							select: {
								name: true,
								_count: {
									select: {
										Vote: {
											where: {
												electionId: id,
											},
										},
									},
								},
							},
						},
						governmentVote: {
							select: {
								name: true,
								_count: true,
							},
						},
						politicalRegimeVote: {
							select: {
								name: true,
								_count: true,
							},
						},
					},
				}),
			]);

			type votesReply = {
				candidateVotes: { [candidateName: string]: number };
				governmentVotes: { [governamentName: string]: number };
				politicalRegimeVotes: { [politicalRegimeName: string]: number };
			};
			const votes: votesReply = {
				candidateVotes: {},
				governmentVotes: {},
				politicalRegimeVotes: {},
			};
			allVotes.map((item) => {
				if (item.candidateVote?.name) {
					votes.candidateVotes[item.candidateVote.name] =
						item.candidateVote._count.Vote;
				}
				if (item.governmentVote?.name) {
					votes.governmentVotes[item.governmentVote.name] =
						item.governmentVote._count.Vote;
				}
				if (item.politicalRegimeVote?.name) {
					votes.politicalRegimeVotes[item.politicalRegimeVote.name] =
						item.politicalRegimeVote._count.Vote;
				}
			});

			return reply.send({
				voting: {
					...voting,
					votes,
				},
			});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				return reply.status(404).send({
					...err,
					name: undefined,
					clientVersion: undefined,
					message: err.message,
					status: 404,
				});
			}
		}
	});
}
