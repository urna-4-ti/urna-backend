import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
import { log } from "node:console";
interface RouteParams {
  id: string;
}

export async function FindOneElection(app: FastifyInstance) {
  app.get<{ Params: RouteParams }>("/election/:id", async (req, reply) => {
    const { id } = req.params;


    console.log(id);

    try {
      const [voting, allVotes] = await prisma.$transaction([
        prisma.election.findUnique({
          where: {
            id,
          },
          include: {
            candidates: true,
            governmentSystem: true,
            politicalRegimes: true,
          },
        }),
        prisma.vote.findMany({
          distinct: ["candidateId", "governmentId", "politicalRegimeId"],
          where: {
            electionId: id
          },
          select: {
            candidateVote: {
              where: {
                electionId: id
              },
              select: {
                name: true,
                electionId: true,
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
              where: {
                electionId: id
              },
              select: {
                name: true,
                electionId: true,
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
            politicalRegimeVote: {
              where: {
                electionId: id
              },
              select: {
                name: true,
                electionId: true,
                _count: {
                  select: {
                    Vote: {
                      where: {
                        electionId: id,
                      },
                    },
                  },
                }
              },
            },
          },
        }),
      ]);

      type votesReply = {
        candidateVotes: { [candidateName: string]: number };
        governmentVotes: { [governamentName: string]: number };
        politicalRegimeVotes: { [politicalRegimeName: string]: number };
				whiteVotes: number;
      };
      const votes: votesReply = {
        candidateVotes: {},
        governmentVotes: {},
        politicalRegimeVotes: {},
				whiteVotes: allVotes.filter((item) => item.whiteVote).length,
      };
      allVotes.map((item) => {
        console.log('onevote: ', item);

        if (item.candidateVote?.name && item.candidateVote.electionId === id) {
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
