"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllPoliticalParty = void 0;
const prisma_1 = require("../../../lib/prisma");
async function FindAllPoliticalParty(app) {
    app.get("/political/:class", async (req, reply) => {
        const { access_token } = req.cookies;
        const { class: CandidateClass } = req.params;
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
            const politicalPartys = await prisma_1.prisma.politicalParty.findMany({
                where: {
                    class: CandidateClass,
                },
            });
            return reply.status(201).send({
                politicalPartys: politicalPartys,
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
exports.FindAllPoliticalParty = FindAllPoliticalParty;
