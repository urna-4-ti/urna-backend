"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const signUp_1 = require("./routes/auth/signUp");
const create_1 = require("./routes/candidate/create");
const jwt_1 = __importDefault(require("@fastify/jwt"));
const dotenv_1 = require("dotenv");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const login_1 = require("./routes/auth/login");
const create_2 = require("./routes/government/create");
const findAll_1 = require("./routes/government/findAll");
const create_3 = require("./routes/politicalParty/create");
const findAll_2 = require("./routes/politicalParty/findAll");
const multipart_1 = __importDefault(require("@fastify/multipart"));
const app = (0, fastify_1.default)();
(0, dotenv_1.config)();
app.register(cors_1.default, {
    origin: process.env.FRONTEND_URL,
    credentials: true,
});
app.register(jwt_1.default, {
    secret: "G83W89GASBRIHB$GKOAEQYHhU%Ugaibrei@gsb54abh5rba",
});
app.register(multipart_1.default, {
    attachFieldsToBody: true,
});
// app.register(bodyParser);
app.addHook("preHandler", (req, res, next) => {
    req.jwt = app.jwt;
    return next();
});
app.register(cookie_1.default, {
    secret: "some-secret-key",
    hook: "preHandler",
});
app.register(signUp_1.signUp);
app.register(login_1.signIn);
app.register(create_1.CreateCandidate);
app.register(create_2.CreateGovernmentForm);
app.register(findAll_1.FindAllGovernmentForm);
app.register(create_3.CreatePoliticalParty);
app.register(findAll_2.FindAllPoliticalParty);
app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
    console.log("server running", value);
});
