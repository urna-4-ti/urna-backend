"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const dotenv_1 = require("dotenv");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const login_1 = require("./routes/auth/login");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const app = (0, fastify_1.default)();
(0, dotenv_1.config)();
app.register(cors_1.default, {
    origin: "http://localhost:3000",
    credentials: true,
});
app.register(jwt_1.default, {
    secret: "G83W89GASBRIHB$GKOAEQYHhU%Ugaibrei@gsb54abh5rba",
});
app.register(multipart_1.default);
app.addHook("preHandler", (req, res, next) => {
    req.jwt = app.jwt;
    return next();
});
app.register(cookie_1.default, {
    secret: "some-secret-key",
    hook: "preHandler",
});
// app.register(signUp);
app.register(login_1.signIn);
// app.register(CreateCandidate);
// app.register(CreateGovernmentForm);
// app.register(FindAllGovernmentForm);
// app.register(CreatePoliticalParty);
// app.register(FindAllPoliticalParty);
// app.register(fastifyHttpErrorsEnhanced);
app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
    console.log("server running", value);
});
