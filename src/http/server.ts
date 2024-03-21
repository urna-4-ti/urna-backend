import fastify from "fastify";
import cors from "@fastify/cors";
import { signUp } from "./routes/auth/signUp";
import fastifyHttpErrorsEnhanced from "fastify-http-errors-enhanced";
require("dotenv").config();
const app = fastify();

app.register(cors, {
	origin: "*",
});
app.register(signUp);
app.register(fastifyHttpErrorsEnhanced);

app.listen({ port: 4000 }).then(() => {
	console.log("server running");
});
