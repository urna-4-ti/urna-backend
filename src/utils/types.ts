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

export type { UserJWTPayload };