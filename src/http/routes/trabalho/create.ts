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

interface FileRequest extends FastifyRequest {
	fileData?: {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		file: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		formFields: any;
	};
}

export async function fileMiddleware(app: FastifyInstance) {
	app.addHook("preHandler", async (req: FileRequest, reply) => {
		if (req.isMultipart()) {
			const file = await req.file();
			console.log("Arquivo recebido:", file);
			const formFields = req.body;

			req.fileData = {
				file,
				formFields,
			};
		}
	});
}

export async function ImportTrabalho(app: FastifyInstance) {
	app.post("/trabalho/import", async (req: FileRequest, reply) => {
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
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const promise = jsonData.map(async (response: any, index) => {
					if (index !== 0) {
						const nome = response.D.toString();
						console.log(nome);
						const existingAuthor = await prisma.usuario.findFirst({
							where: {
								nome: nome,
							},
						});

						// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
						let authorId;

						console.log(existingAuthor);
						console.log(authorId);

						if (!existingAuthor) {
							const newAuthor = await prisma.usuario.create({
								data: {
									nome: response.D.toString(),
									cpf: await encrypt(formatCpf(response.E.toString())),
									email: await encrypt(response.F.toString()),
									telefone: formatTelefone(response.G.toString()),
									formacao: response.H.toString(),
									role: "NORMAL",
								},
							});

							authorId = newAuthor.id;
						} else {
							authorId = existingAuthor.id;
							console.log(authorId);
						}

						await prisma.trabalho.create({
							data: {
								instituicao: await encrypt(response.H.toString()),
								nivel_ensino: await encrypt(response.I.toString()),
								titulo_trabalho: await encrypt(response.AL.toString()),
								modalidade: response.AK.toString(),
								area:
									response.AO !== undefined
										? response.AO
										: response.AP === undefined
											? ""
											: response.AP,
								autores: {
									connect: {
										id: authorId,
									},
								},
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
					error: err,
				});
			}
		}
	});
}
