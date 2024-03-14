import fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "../utils/env";
require("dotenv").config();

const app = fastify();
app.register(cors, {
	origin: env.FRONTEND_URL,
	credentials: true,
});

app.listen({ port: 4000 }).then(() => {
	console.log("server running");
});
