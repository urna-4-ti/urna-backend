import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";
import type {UserJWTPayload} from "../../utils/types";

export async function updateVoter(app: FastifyInstance) {
    app.put("/updateVoter/:userId", async (request, reply) => {
        const updateUserBody = z.object({
            name: z.string(),
            role: z.enum(["ADMIN","VOTER"]),
            enrollment: z.string(),
            email: z.string().email(),
            password: z.string(),
            class: z.enum(["TI_1","TI_2","TI_3","TI_4","TQ_1","TQ_2","TQ_3","TQ_4","TMA_1","TMA_2","TMA_3","TMA_4",
            "TA_1","TA_2","TA_3","TA_4","ADMIN"]),
        });

        const data = updateUserBody.parse(
            request.body
        );

        const {userId} = request.params

    
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

        const { enrollment, name, email, class: userClass } = updateUserBody.parse(
            request.body
        );

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data,
        });

        return reply.status(201)
    });
}
