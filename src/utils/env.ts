import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url().optional(),
	FRONTEND_URL: z.string().url().optional(),
	CRYPTO_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
