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
		const body = await req.file();
		const pump = util.promisify(pipeline);
		const file = {
			file: body?.file,
			filename: body?.filename,
		};

		console.log(body?.fields)

		// biome-ignore lint/performance/noDelete: <explanation>
		delete body?.fields.photo;

		
		const parsedFields = body?.fields as Fields;
		
		
		const fields = {
			name: parsedFields.name.value,
			cod: Number(parsedFields.cod.value),
			description: parsedFields.description.value,
			politicalPartyId: parsedFields.politicalPartyId.value,
		};
		console.log(fields.cod, typeof fields.cod);
		const bodyschema = z.object({
			cod: z.number(),
			name: z.string(),
			picPath: z.string().optional(),
			politicalPartyId: z.string(),
			description: z.string(),
		});
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
			if (file?.file) {
				await pump(
					file.file,
					fs.createWriteStream(`uploads/${randomUUID()}-${file.filename}`),
				);
				data.picPath = `uploads/${randomUUID()}-${file.filename}`;
			} else {
				return reply.status(404).send({
					message: "File not provided",
				});
			}
			console.log(data)
			await prisma.candidate.create({
				data:{
					cod: data.cod,
					description:data.description,
					name:data.name,
					picPath:data.picPath,
					politicalPartyId: data.politicalPartyId
				}
			})
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
