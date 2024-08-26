import { Election, Prisma, Candidate, PoliticalRegime, Government } from "@prisma/client";
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
          distinct: ["candidateId", "governmentId", "politicalRegimeId", 'whiteVote'],
          where: {
            electionId: id
          },
          select: {
            whiteVote: true,
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



      const votingWhitVotes = {
        name: voting?.name,
        class: voting?.class,
        id: voting?.id,
        status: voting?.status,
        politicalRegimes: voting?.politicalRegimes.map(regime => ({ ...regime, votes: 0 })),
        governmentSystem: voting?.governmentSystem.map(system => ({ ...system, votes: 0 })),
        candidates: voting?.candidates.map(candidate => ({ ...candidate, votes: 0 }))
      }

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
      if (voting?.politicalRegimes) {

        votingWhitVotes.politicalRegimes = voting?.politicalRegimes.map(regime => ({
          ...regime,
          votes: votes.politicalRegimeVotes[regime.name] || 0
        }))
      }
      if (voting?.candidates) {
        votingWhitVotes.candidates = voting.candidates.map(candidate => ({
          ...candidate,
          votes: votes.candidateVotes[candidate.name] || 0
        }))
      }
      if (voting?.governmentSystem) {
        votingWhitVotes.governmentSystem = voting.governmentSystem.map(government => ({
          ...government,
          votes: votes.governmentVotes[government.name] || 0
        }))
      }

      votingWhitVotes.candidates?.sort((a, b) => b.votes - a.votes)
      votingWhitVotes.politicalRegimes?.sort((a, b) => b.votes - a.votes)
      votingWhitVotes.governmentSystem?.sort((a, b) => b.votes - a.votes)
      return reply.send({
        voting: {
          ...votingWhitVotes,
          votes
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
