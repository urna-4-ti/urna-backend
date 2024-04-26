import fjwt from "@fastify/jwt";
import { config } from "dotenv";
import fCookie from "@fastify/cookie";
import fastMultipart from "@fastify/multipart";
import fastify from "fastify";
import cors from "@fastify/cors";
import fstatic from "@fastify/static";
import path from "node:path";

// routes
import { signUp } from "./routes/auth/signUp";
import { signIn } from "./routes/auth/login";
import { CreateCandidate } from "./routes/candidate/create";
import { CreateGovernmentForm } from "./routes/government/create";
import { FindAllGovernmentForm } from "./routes/government/findAll";
import { CreatePoliticalParty } from "./routes/politicalParty/create";
import { FindAllPoliticalParty } from "./routes/politicalParty/findAll";
import { createVoter } from "./routes/voter/create";
import { getAllVoters } from "./routes/voter/findAll";
import { getCandidate } from "./routes/candidate/findAll";

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
	attachFieldsToBody: true,
});

app.addHook("preHandler", (req, res, next) => {
	req.jwt = app.jwt;
	return next();
});

app.register(fCookie, {
	secret: "some-secret-key",
	hook: "preHandler",
});
app.register(fstatic, {
	root: path.join(__dirname, "../../uploads"),
	prefix: "/public/",
});
// console.log(path.join(__dirname, "../../uploads"));

// routes
app.register(signUp);
app.register(signIn);
app.register(CreateCandidate);
app.register(getCandidate);
app.register(CreateGovernmentForm);
app.register(FindAllGovernmentForm);
app.register(CreatePoliticalParty);
app.register(FindAllPoliticalParty);
app.register(createVoter);
app.register(getAllVoters);

app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("server running", value);
});