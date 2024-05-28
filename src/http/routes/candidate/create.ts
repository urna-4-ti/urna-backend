// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";

export async function CreateCandidate(app: FastifyInstance) {
	app.post("/candidate", async (req, reply) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = await req.body;

		const pump = util.promisify(pipeline);
		const file = body.photo.toBuffer();

		const bodyschema = z.object({
			cod: z.number(),
			name: z.string(),
			picPath: z.string().optional(),
			politicalPartyId: z.string(),
			description: z.string(),
		});

		const fields = {
			name: body.name.value,
			cod: Number(body.cod.value),
			description: body.description.value,
			politicalPartyId: body.politicalPartyId.value,
		};

		// console.log(fields);

		const data = bodyschema.parse(fields);
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
			console.log(body.photo.filename);

			if (file) {
				const uid = randomUUID();
				await pump(
					file,
					fs.createWriteStream(`uploads/${uid}-${body.photo.filename}`),
				);
				data.picPath = `${uid}-${body.photo.filename}`;
			} else {
				return reply.status(404).send({
					message: "File not provided",
				});
			}
			await prisma.candidate.create({
				data: {
					cod: data.cod,
					description: data.description,
					name: data.name,
					picPath: data.picPath,
					politicalPartyId: data.politicalPartyId,
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
