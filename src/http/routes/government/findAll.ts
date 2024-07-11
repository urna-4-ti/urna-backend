// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";

interface RouteParams {
	id: string;
}

export async function FindAllGovernmentForm(app: FastifyInstance) {
	app.get("/government/form", async (req, reply) => {
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

		try {
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

			const governmentForms = await prisma.government.findMany();
			return reply.status(201).send({
				governments: governmentForms,
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

export async function FindGovernmentFormId(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>(
		"/government/form/:id",
		async (req, reply) => {
			const { id: governmentId } = req.params;
			console.log(
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa find one government",
			);

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
				const governmentForms = await prisma.government.findFirstOrThrow({
					where: {
						id: governmentId,
					},
				});
				return reply.status(201).send({
					governments: governmentForms,
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
