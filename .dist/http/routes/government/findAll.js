"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllGovernmentForm = void 0;
const prisma_1 = require("../../../lib/prisma");
async function FindAllGovernmentForm(app) {
    app.get("/government/form", async (req, reply) => {
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
            const governmentForms = await prisma_1.prisma.politicalType.findMany();
            return reply.status(201).send({
                governments: governmentForms,
            });
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
exports.FindAllGovernmentForm = FindAllGovernmentForm;
