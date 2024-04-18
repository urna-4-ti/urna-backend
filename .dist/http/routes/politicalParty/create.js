"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePoliticalParty = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const node_fs_1 = __importDefault(require("node:fs"));
const node_util_1 = __importDefault(require("node:util"));
const node_stream_1 = require("node:stream");
const node_crypto_1 = require("node:crypto");
async function CreatePoliticalParty(app) {
    app.post("/political", async (req, reply) => {
        const body = await req.file();
        const pump = node_util_1.default.promisify(node_stream_1.pipeline);
        const file = {
            file: body?.file,
            filename: body?.filename,
        };
        // biome-ignore lint/performance/noDelete: <explanation>
        delete body?.fields.photo;
        const bodyschema = zod_1.z.object({
            name: zod_1.z.string(),
            class: zod_1.z.enum([
                "TI_1",
                "TI_2",
                "TI_3",
                "TI_4",
                "TQ_1",
                "TQ_2",
                "TQ_3",
                "TQ_4",
                "TMA_1",
                "TMA_2",
                "TMA_3",
                "TMA_4",
                "TA_1",
                "TA_2",
                "TA_3",
                "TA_4",
                "ADMIN",
            ]),
            politicalTypeId: zod_1.z.string().uuid(),
            photo: zod_1.z.string().optional(),
        });
        const parsedFields = body?.fields;
        const fields = {
            name: parsedFields.name.value,
            class: parsedFields.class.value,
            politicalTypeId: parsedFields.politicalTypeId.value,
        };
        const data = bodyschema.parse(fields);
        console.log(req.cookies);
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
                data.photo = `uploads/${file.filename}-${(0, node_crypto_1.randomUUID)()}`;
            }
            else {
                return reply.status(404).send({
                    message: "File not provided",
                });
            }
            await prisma_1.prisma.politicalParty.create({
                data: {
                    class: data.class,
                    name: data.name,
                    photoUrl: data.photo,
                    politicalTypeId: data.politicalTypeId,
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
exports.CreatePoliticalParty = CreatePoliticalParty;
