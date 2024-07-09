// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";

interface RouteParams {
	id: string;
}

export async function DeletePoliticalRegime(app: FastifyInstance) {
	app.delete<{ Params: RouteParams }>(
		"/politicalRegime/:id",
		async (req, reply) => {
			const { id } = req.params;

			let userJWTData: UserJWTPayload | null = null;
			try {
				const authorization = req.headers.authorization;
				const access_token = authorization?.split("Bearer ")[1];
				userJWTData = app.jwt.decode(access_token as string);
			} catch (error) {
				return reply.status(403).send({
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
				const politicalRegime = await prisma.politicalRegime.delete({
					where: {
						id,
					},
				});
				return reply.status(201).send();
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
