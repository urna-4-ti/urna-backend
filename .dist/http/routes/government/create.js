"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGovernmentForm = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
async function CreateGovernmentForm(app) {
    app.post("/government/form", async (req, reply) => {
        const bodyschema = zod_1.z.object({
            cod: zod_1.z.number(),
            name: zod_1.z.string(),
        });
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const body = req.body;
        const fields = {
            cod: Number(body.cod.values),
            name: body.name.values,
        };
        const data = bodyschema.parse(fields);
        const { access_token } = req.cookies;
        const userJWTData = app.jwt.decode(access_token);
        const loggedUser = await prisma_1.prisma.user.findUnique({
            where: {
                email: userJWTData?.email,
            },
        });
        console.log(loggedUser);
        if (loggedUser?.role !== "ADMIN") {
            return reply.status(403).send({
                message: "Action not permitted",
            });
        }
        try {
            await prisma_1.prisma.politicalType.create({
                data: { ...data },
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
exports.CreateGovernmentForm = CreateGovernmentForm;
