// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline, type PipelineSource } from "node:stream";
import { randomUUID } from "node:crypto";

interface RouteParams {
	id: string;
}

export async function EditPoliticalParty(app: FastifyInstance) {
	app.patch<{ Params: RouteParams }>("/political/:id", async (req, reply) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = await req.body;
		const { id } = req.params;
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
			photoUrl: z.string().optional(),
		});

		const fields = {
			name: body.name.value,
			class: body.class.value,
			politicalTypeId: body.politicalTypeId.value,
		};

		const data = bodyschema.parse(fields);
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

		let file: PipelineSource<File> | null = null;

		if (body.photo) {
			file = body.photo.toBuffer();
		}

		fs.access("uploads", fs.constants.F_OK, (err) => {
			if (err) {
				fs.mkdirSync("uploads");
			}
		});
		try {
			if (file) {
				await pump(
					file,
					fs.createWriteStream(
						`uploads/${randomUUID()}-${body.photo.filename}`,
					),
				);
				data.photoUrl = `uploads/${randomUUID()}-${body.photo.filename}`;
				await prisma.politicalParty.update({
					where: { id },
					data: {
						class: data.class,
						name: data.name,
						photoUrl: data.photoUrl,
						politicalTypeId: data.politicalTypeId,
					},
				});
			}
			if (!data.photoUrl) {
				await prisma.politicalParty.update({
					where: { id },
					data: {
						class: data.class,
						name: data.name,
						politicalTypeId: data.politicalTypeId,
					},
				});
			}

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
