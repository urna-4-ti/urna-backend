import fastify from "fastify";
import cors from "@fastify/cors";
import { signUp } from "./routes/auth/signUp";
require("dotenv").config();

const app = fastify();

app.register(cors, {
	origin: "*",
});

app.register(signUp);

app.listen({ port: 4000 }).then(() => {
	console.log("server running");
});
