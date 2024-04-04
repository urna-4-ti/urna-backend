import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export async function createVoter(app: FastifyInstance) {
    app.post("/createVoter", async (request, reply) => {
        const createUserBody = z.object({
            enrollment: z.string(),
            name: z.string(),
            email: z.string().email(),
            class: z.enum(["TI_1","TI_2","TI_3","TI_4","TQ_1","TQ_2","TQ_3","TQ_4","TMA_1","TMA_2","TMA_3","TMA_4",
            "TA_1","TA_2","TA_3","TA_4","ADMIN"]),
        });

        const data = createUserBody.parse(
            request.body
        );

        const { access_token } = request.cookies;

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

        const user = await prisma.user.create({
            data: {
                enrollment,
                name,
                email,
                class,
            },
        });
        return reply.status(201)
    });
}
