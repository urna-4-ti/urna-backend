import type { JWT } from "@fastify/jwt";

declare module "fastify" {
	interface FastifyRequest {
		jwt: JWT;
	}
}

type UserJWTPayload = {
	id: string;
	email: string;
	name: string;
};

enum classes2 {
	ti1 = "TI_1",
	TI_2 = "TI_2",
	TI_3 = "TI_3",
	TI_4 = "TI_4",
	TQ_1 = "TQ_1",
	TQ_2 = "TQ_2",
	TQ_3 = "TQ_3",
	TQ_4 = "TQ_4",
	TMA_1 = "TMA_1",
	TMA_2 = "TMA_2",
	TMA_3 = "TMA_3",
	TMA_4 = "TMA_4",
	TA_1 = "TA_1",
	TA_2 = "TA_2",
	TA_3 = "TA_3",
	TA_4 = "TA_4",
}

export { type UserJWTPayload, classes2 };
