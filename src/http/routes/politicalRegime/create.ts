// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";

export async function CreatePoliticalRegime(app: FastifyInstance) {
	app.post("/politicalRegime", async (req, reply) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = await req.body;
		console.log(body);

		const fields = {
			name: body.name.value,
			cod: Number(body.cod.value),
		};

		// console.log(fields);

		const bodyschema = z.object({
			cod: z.number(),
			name: z.enum([
				"Parlamentarismo",
				"Presidencialismo",
				"SemiPresidencialismo",
			]),
		});
		const data = bodyschema.parse(fields);

		let userJWTData: UserJWTPayload | null;
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
			console.log(data);
			await prisma.politicalRegime.create({
				data: {
					cod: data.cod,
					name: data.name,
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
	});
}
