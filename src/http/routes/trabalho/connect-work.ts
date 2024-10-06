import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import fastifyMultipart from "@fastify/multipart";

interface RouteParams {
	avaliador: string;
	trabalho: string;
}

export async function ConnectWork(app: FastifyInstance) {
	app.patch<{ Params: RouteParams }>(
		"/trabalho/avaliador/connect/:avaliador/:trabalho",
		async (req, reply) => {
			const { trabalho: idTrabalho, avaliador: idAvaliador } = req.params;

			if (!idTrabalho || !idAvaliador) {
				return reply.status(400).send({
					message: "Missing required parameters",
				});
			}

			try {
				const trabalho = await prisma.trabalho.findUnique({
					where: {
						id: idTrabalho,
					},
				});

				if (!trabalho) {
					return reply.status(404).send({
						message: "Trabalho not found",
					});
				}

				const avaliador = await prisma.usuario.findUnique({
					where: {
						id: idAvaliador,
					},
				});

				if (!avaliador) {
					return reply.status(404).send({
						message: "Avaliador not found",
					});
				}

				// Verifique se o avaliador já está conectado ao trabalho
				const existingConnection = await prisma.trabalho.findFirst({
					where: {
						id: idTrabalho,
						autores: {
							some: {
								id: idAvaliador,
							},
						},
					},
				});

				if (existingConnection) {
					return reply.status(400).send({
						message: "Avaliador already connected to trabalho",
					});
				}

				// Conecte o avaliador ao trabalho
				await prisma.trabalho.update({
					where: {
						id: idTrabalho,
					},
					data: {
						autores: {
							connect: {
								id: idAvaliador,
							},
						},
					},
				});

				return reply.status(201).send({
					message: "Trabalho connected to avaliador successfully",
				});
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				return reply.status(403).send({
					message: err.message,
					statusCode: 403,
					error: err,
				});
			}
		},
	);
}
