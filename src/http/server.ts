import fastify from "fastify";
import cors from "@fastify/cors";
import { signUp } from "./routes/auth/signUp";
import fastifyHttpErrorsEnhanced from "fastify-http-errors-enhanced";
import { CreateCandidate } from "./routes/candidate/create";
require("dotenv").config();
const app = fastify();

app.register(cors, {
	origin: "*",
});
app.register(signUp);
app.register(fastifyHttpErrorsEnhanced);
app.register(CreateCandidate);

app.listen({ port: 4000 }).then(() => {
	console.log("server running");
});
