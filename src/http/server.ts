import fjwt from "@fastify/jwt";
import { config } from "dotenv";
import fCookie from "@fastify/cookie";
import fastMultipart from "@fastify/multipart";
import fastify, { FastifyReply } from "fastify";
import cors from "@fastify/cors";
import fstatic from "@fastify/static";
import path from "node:path";

// routes
import { signUp } from "./routes/auth/signUp";
import { signIn } from "./routes/auth/login";
import { CreateCandidate } from "./routes/candidate/create";
import { CreateGovernmentForm } from "./routes/government/create";
import {
	FindAllGovernmentForm,
	FindGovernmentFormId,
} from "./routes/government/findAll";
import { CreatePoliticalParty } from "./routes/politicalParty/create";
import {
	FindAllPoliticalParty,
	FindClassPoliticalParty,
	FindIdPoliticalParty,
} from "./routes/politicalParty/findAll";
import { createVoter } from "./routes/voter/create";
import { getAllVoters, getVoterId } from "./routes/voter/findAll";
import { EditCandidate } from "./routes/candidate/edit";
import {
	FindAllCandidates,
	FindCandidatesId,
} from "./routes/candidate/findAll";
import { EditGovernment } from "./routes/government/edit";
import { EditPoliticalParty } from "./routes/politicalParty/edit";
import { EditVoter } from "./routes/voter/edit";
import { DeleteCandidate } from "./routes/candidate/delete";
import { DeleteGovernment } from "./routes/government/delete";
import { DeletePoliticalParty } from "./routes/politicalParty/delete";
import { DeleteVoter } from "./routes/voter/delete";
import { CreatePoliticalRegime } from "./routes/politicalRegime/create";
import { DeletePoliticalRegime } from "./routes/politicalRegime/delete";
import { EditPoliticalRegime } from "./routes/politicalRegime/edit";
import { GetPoliticalRegime } from "./routes/politicalRegime/get";
import { FindAllElections } from "./routes/election/findAll";
import { FindOneElection } from "./routes/election/findOne";
import { Vote } from "./routes/election/vote";
import { CreateElection } from "./routes/election/create";

const app = fastify();

config();

app.register(cors, {
	origin: process.env.FRONTEND_URL ?? "https://ifurna.vercel.app",
	credentials: true,
	allowedHeaders: ["Authorization"],
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

// routes

// auth
app.register(signUp);
app.register(signIn);
// =======================
// candidate
app.register(CreateCandidate);
app.register(EditCandidate);
app.register(FindAllCandidates);
app.register(FindCandidatesId);
app.register(DeleteCandidate);
// =======================
// government
app.register(CreateGovernmentForm);
app.register(FindAllGovernmentForm);
app.register(FindGovernmentFormId);
app.register(EditGovernment);
app.register(DeleteGovernment);
// =======================
// politicalPaty
app.register(CreatePoliticalParty);
app.register(FindClassPoliticalParty);
app.register(FindAllPoliticalParty);
app.register(FindIdPoliticalParty);
app.register(EditPoliticalParty);
app.register(DeletePoliticalParty);
// =======================
// voter
app.register(createVoter);
app.register(getAllVoters);
app.register(EditVoter);
app.register(DeleteVoter);
app.register(getVoterId);
app.register(GetPoliticalRegime);
app.register(CreatePoliticalRegime);
app.register(EditPoliticalRegime);
app.register(DeletePoliticalRegime);

// =======================
// voting
app.register(CreateElection);
app.register(FindAllElections);
app.register(FindOneElection);
app.register(Vote);
app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("teste", process.env.FRONTEND_URL);
	console.log("server running TESTEEEEEEEEEEEEEEEEEEEEEEE", value);
});
