// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import type { MultipartFile } from "@fastify/multipart";
import { randomUUID } from "node:crypto";

export async function CreatePoliticalParty(app: FastifyInstance) {
	app.post("/political", async (req, reply) => {
		const body = await req.file();

		console.log(body?.fields);

		const pump = util.promisify(pipeline);
		const bodyschema = z.object({
			name: z.string(),
			class: z.enum([
				"TI_1",
				"TI_2",
				"TI_3",
				"TI_4",
				"TQ_1",
				"TQ_2",
				"TQ_3",
				"TQ_4",
				"TMA_1",
				"TMA_2",
				"TMA_3",
				"TMA_4",
				"TA_1",
				"TA_2",
				"TA_3",
				"TA_4",
				"ADMIN",
			]),
			politicalTypeId: z.string().uuid(),
			photo: z.string().optional(),
		});
		const data = bodyschema.parse(body?.fields);
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
			// if (file) {
			// 	await pump(
			// 		file.file,
			// 		fs.createWriteStream(`uploads/${file.filename}-${randomUUID()}`),
			// 	);
			// 	data.photoUrl = `uploads/${file.filename}-${randomUUID()}`;
			// } else {
			// 	return reply.status(404).send({
			// 		message: "File not provided",
			// 	});
			// }

			await prisma.politicalParty.create({
				data: {
					class: data.class,
					name: data.name,
					photoUrl: data.photo,
					politicalTypeId: data.politicalTypeId,
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
