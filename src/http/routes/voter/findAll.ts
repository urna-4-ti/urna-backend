import type { FastifyInstance } from "fastify";
import { decrypt } from "../../../lib/crypto";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";

export async function getAllVoters(app: FastifyInstance) {
	app.get("/voter", async (req, reply) => {
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
				msg: "An error occuried",
				error: error,
			});
		}
	});
}

// FN SOMENTE PEGANDO O ID
interface RouteParams {
	id: string;
}

export async function getVoterId(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/voter/:id", async (req, reply) => {
		const { access_token } = req.cookies;
		const { id: VoterId } = req.params;

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
			const dbData = await prisma.user.findUniqueOrThrow({
				where: {
					id: VoterId,
				},
			});

			const dbDataDecrypted = async () => {
				dbData.enrollment = await decrypt(dbData.enrollment);
				dbData.name = await decrypt(dbData.name);
				return dbData;
			};

			const classVoters = await dbDataDecrypted();

			console.log("TESTE", classVoters);

			return reply.status(200).send({
				data: classVoters,
			});
		} catch (error) {
			return reply.status(401).send({
				msg: "An error occuried",
				error: error,
			});
		}
	});
}
