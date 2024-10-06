import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";

interface RouteParams {
	idUser: string;
}

export async function getOneTrabalho(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/trabalhos/:idUser", async (req, reply) => {
		const { idUser } = req.params;

		try {
			const dbData = await prisma.trabalho.findMany({
				where: {
					autores: {
						some: {
							id: idUser,
						},
					},
				},
				select: {
					id: true,
					instituicao: true,
					titulo_trabalho: true,
					nivel_ensino: true,
					modalidade: true,
					autores: {
						select: {
							nome: true,
							email: true,
							cpf: true,
						},
					},
					area: true,
				},
			});

			if (dbData) {
				const trabalhos = await Promise.all(
					dbData.map(async (item) => {
						item.instituicao = await decrypt(item.instituicao);
						item.titulo_trabalho = await decrypt(item.titulo_trabalho);
						item.nivel_ensino = await decrypt(item.nivel_ensino);
						item.autores = await Promise.all(
							item.autores.map(async (autor) => {
								autor.email = await decrypt(autor.email);
								autor.cpf = await decrypt(autor.cpf);
								return autor;
							}),
						);
						return item;
					}),
				);

				return reply.status(200).send({
					data: trabalhos,
				});
			}
		} catch (error) {
			return reply.status(401).send({
				message: "An error occurred",
				error: error,
			});
		}
	});
}
