import fastify from "fastify";
import cors from "@fastify/cors";
import { signUp } from "./routes/auth/signUp";
import fastifyHttpErrorsEnhanced from "fastify-http-errors-enhanced";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import { config } from "dotenv";
import fCookie from "@fastify/cookie";
import { signIn } from "./routes/auth/login";
const app = fastify();

config();
app.register(cors, {
	origin: "*",
});

app.register(fjwt, {
	secret: "G83W89GASBRIHB$GKOAEQYHhU%Ugaibrei@gsb54abh5rba",
});
app.addHook("preHandler", (req, res, next) => {
	req.jwt = app.jwt;
	return next();
});

app.register(fCookie, {
	secret: "some-secret-key",
	hook: "preHandler",
});

app.register(signUp);
app.register(signIn);

app.register(fastifyHttpErrorsEnhanced);
app.listen({ port: 4000 }).then(() => {
	console.log("server running");
});
