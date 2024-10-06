import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../../lib/prisma";
import util from "node:util";
import XLSX from "xlsx";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import path from "node:path";
import { encrypt } from "src/lib/crypto";

interface ResData {
	D: string;
	E: string;
	F: string;
	G: string;
}

interface FileRequest extends FastifyRequest {
	fileData?: {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		file: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		formFields: any;
	};
}

export async function ImportAvaliador(app: FastifyInstance) {
	app.post("/avaliador/import", async (req: FileRequest, reply) => {
		const fileData = req.fileData;

		if (!fileData) {
			return reply.status(404).send({
				message: "File not provided",
			});
		}

		const file = fileData.file;
		const extension = path.extname(file.filename);

		if (extension !== ".xlsx") {
			return reply.status(400).send({
				message: "File must be xlsx",
			});
		}

		fs.access("uploads", fs.constants.F_OK, (err) => {
			if (err) {
				fs.mkdirSync("uploads");
			}
		});

		const uid = randomUUID();
		const filePath = `uploads/${uid}-${file.filename}`;
		const writeStream = fs.createWriteStream(filePath);
		const pump = util.promisify(pipeline);
		await pump(file.file, writeStream);

		const fileBuffer = await fs.promises.readFile(filePath);
		const workbook = XLSX.read(fileBuffer, { type: "buffer" });

		const sheetNames = workbook.SheetNames;

		// biome-ignore lint/correctness/noUnreachable: <explanation>
		for (let i = 0; i < sheetNames.length; i++) {
			const worksheet = workbook.Sheets[sheetNames[i]];
			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

			const formatCpf = (cpf: string) => {
				const entrada = cpf.replace(/\D+/g, "");
				const saida = entrada.replace(
					/^(\d{3})(\d{3})(\d{3})(\d{2})$/,
					"$1.$2.$3-$4",
				);
				return saida;
			};

			const formatTelefone = (telefone: string) => {
				const entrada = telefone.replace(/\D+/g, "");
				return entrada;
			};

			try {
				const user = await prisma.usuario.findMany({
					where: {
						role: "AVALIADOR",
					},
				});
				if (user) {
					await prisma.usuario.deleteMany();
				}

				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const promise = jsonData.map(async (response: any) => {
					if (response.D !== "Nome:") {
						await prisma.usuario.upsert({
							where: { cpf: response.E.toString() },
							create: {
								nome: response.D.toString(),
								cpf: await encrypt(formatCpf(response.E.toString())),
								telefone: formatTelefone(response.G.toString()),
								email: await encrypt(response.F.toString()),
								role: "AVALIADOR",
								formacao: response.I.toString(),
								interesse: response.K.toString(),
								disponilidade: response.L.toString(),
							},
							update: {
								nome: response.D.toString(),
								telefone: formatTelefone(response.G.toString()),
								email: await encrypt(response.F.toString()),
							},
						});
					}
				});

				await Promise.all(promise);

				return reply.status(201).send({
					message: "created successfully",
				});
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				return reply.status(403).send({
					message: err.message,
					statusCode: 403,
				});
			}
		}
	});
}
