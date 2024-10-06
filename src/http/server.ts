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

import fastifyMultipart from "@fastify/multipart";
import { ConnectWork } from "./routes/trabalho/connect-work";
import { ImportTrabalho } from "./routes/trabalho/create";
import { deleteTrabalho } from "./routes/trabalho/delete";
import { getOneTrabalho } from "./routes/trabalho/find-one";
import { getTrabalho } from "./routes/trabalho/find";
import { DisconnectWork } from "./routes/trabalho/remove-connect";
import { ImportAvaliador } from "./routes/avaliador/create";
import { deleteAvaliador } from "./routes/avaliador/delete";
import { getOneAvaliador } from "./routes/avaliador/find-one";
import { getAvaliadores } from "./routes/avaliador/find";
import { fileMiddleware } from "src/lib/middleware";

const app = fastify();

config();

app.register(cors, {
	origin: process.env.FRONTEND_URL,
	credentials: true,
	allowedHeaders: ["Authorization"],
});

app.register(fjwt, {
	secret: process.env.JWT_ASSIGN || "secret-key",
});
app.register(fastMultipart, {
	attachFieldsToBody: true,
});

app.addHook("preHandler", (req, _, next) => {
	req.jwt = app.jwt;
	return next();
});
app.register(fCookie, {
	secret: process.env.COOKIE_SECRET,
	hook: "preHandler",
});

app.register(fstatic, {
	root: path.join(__dirname, "../../uploads"),
	prefix: "/public/",
});

app.register(fileMiddleware);
// routes

// auth
app.register(signUp);
app.register(signIn);

// =======================

//TRABALHOS

app.register(ConnectWork);
app.register(ImportTrabalho);
app.register(deleteTrabalho);
app.register(getOneTrabalho);
app.register(getTrabalho);
app.register(DisconnectWork);

// =======================

//AVALIADOR

app.register(ImportAvaliador);
app.register(deleteAvaliador);
app.register(getOneAvaliador);
app.register(getAvaliadores);

// =======================

app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("front-url", process.env.FRONTEND_URL);
	console.log("alteração surtiu efeito");

	console.log("server running", value);
});
