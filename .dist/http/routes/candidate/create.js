"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCandidate = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const node_fs_1 = __importDefault(require("node:fs"));
const node_util_1 = __importDefault(require("node:util"));
const node_stream_1 = require("node:stream");
const node_crypto_1 = require("node:crypto");
async function CreateCandidate(app) {
    app.post("/candidate", async (req, reply) => {
        // console.log(req.body);
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const body = await req.body;
        console.log(body);
        const pump = node_util_1.default.promisify(node_stream_1.pipeline);
        const file = {
            file: body?.photo.file,
            filename: body?.photo.filename,
        };
        // biome-ignore lint/performance/noDelete: <explanation>
        delete body?.photo;
        const fields = {
            name: body.name.value,
            cod: Number(body.cod.value),
            description: body.description.value,
            politicalPartyId: body.politicalPartyId.value,
        };
        // console.log(fields);
        const bodyschema = zod_1.z.object({
            cod: zod_1.z.number(),
            name: zod_1.z.string(),
            picPath: zod_1.z.string().optional(),
            politicalPartyId: zod_1.z.string(),
            description: zod_1.z.string(),
        });
        const data = bodyschema.parse(fields);
        const { access_token } = req.cookies;
        const userJWTData = app.jwt.decode(access_token);
        const loggedUser = await prisma_1.prisma.user.findUnique({
            where: {
                email: userJWTData?.email,
            },
        });
        if (loggedUser?.role !== "ADMIN") {
            return reply.status(403).send({
                message: "Action not permitted",
            });
        }
        try {
            if (file?.file) {
                await pump(file.file, node_fs_1.default.createWriteStream(`uploads/${(0, node_crypto_1.randomUUID)()}-${file.filename}`));
                data.picPath = `uploads/${(0, node_crypto_1.randomUUID)()}-${file.filename}`;
            }
            else {
                return reply.status(404).send({
                    message: "File not provided",
                });
            }
            console.log(data);
            await prisma_1.prisma.candidate.create({
                data: {
                    cod: data.cod,
                    description: data.description,
                    name: data.name,
                    picPath: data.picPath,
                    politicalPartyId: data.politicalPartyId,
                },
            });
            return reply.status(201).send();
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        }
        catch (err) {
            return reply.status(403).send({
                message: err.message,
                statusCode: 403,
            });
        }
    });
}
exports.CreateCandidate = CreateCandidate;
