// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";

interface RouteParams{
    id: string;
}

export async function EditPoliticalRegime(app: FastifyInstance) {
	app.patch<{ Params: RouteParams}>("/politicalRegime/:id", async (req, reply) => {

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = await req.body;
		console.log(body);

		const fields = {
			name: body.name.value,
			cod: Number(body.cod.value),
		};

		const bodyschema = z.object({
			cod: z.number(),
			name: z.enum(["Parlamentarismo","Presidencialismo","SemiPresidencialismo"]),
		});
		const data = bodyschema.parse(fields);
		const { access_token } = req.cookies;

        const {id} = req.params;

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
		const politicalRegime = await prisma.politicalRegime.update({
            where: {
                id
            },
            data: {
                name: data.name,
                cod: data.cod,
            }
        });
            return reply.status(201).send();
		} catch (err: any) {
			return reply.status(403).send({
				message: err.message,
				statusCode: 403,
			});
		}
	});
}
