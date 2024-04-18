import fastify from "fastify";
import cors from "@fastify/cors";
import { signUp } from "./routes/auth/signUp";
import fastifyHttpErrorsEnhanced from "fastify-http-errors-enhanced";

import { CreateCandidate } from "./routes/candidate/create";

import fjwt, { FastifyJWT } from "@fastify/jwt";
import { config } from "dotenv";
import fCookie from "@fastify/cookie";
import { signIn } from "./routes/auth/login";
import { CreateGovernmentForm } from "./routes/government/create";
import { FindAllGovernmentForm } from "./routes/government/findAll";
import { CreatePoliticalParty } from "./routes/politicalParty/create";
import { FindAllPoliticalParty } from "./routes/politicalParty/findAll";
import fastMultipart from "@fastify/multipart";

const app = fastify();

config();
app.register(cors, {
	origin: process.env.FRONTEND_URL,
	credentials: true,
});

app.register(fjwt, {
	secret: "G83W89GASBRIHB$GKOAEQYHhU%Ugaibrei@gsb54abh5rba",
});
app.register(fastMultipart, {
	attachFieldsToBody: "keyValues",
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
app.register(CreateCandidate);
app.register(CreateGovernmentForm);
app.register(FindAllGovernmentForm);
app.register(CreatePoliticalParty);
app.register(FindAllPoliticalParty);

app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("server running", value);
});
