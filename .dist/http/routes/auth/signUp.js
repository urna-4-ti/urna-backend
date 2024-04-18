"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = void 0;
const zod_1 = require("zod");
const crypto_1 = require("../../../lib/crypto");
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("@prisma/client");
async function signUp(app) {
    app.post("/auth/signUp", async (request, reply) => {
        const loginBody = zod_1.z.object({
            name: zod_1.z.string(),
            email: zod_1.z.string().email("The field is not email"),
            password: zod_1.z
                .string()
                .min(6, "The password must be 6 characters or longer")
                .refine((password) => /[A-Z]/.test(password), "The password must contain at least one capital letter")
                .refine((password) => /[0-9]/.test(password), "The password must contain at least one number")
                .refine((password) => /[#-@]/.test(password), "The password must contain at least one of the special characters: #, -, @"),
            role: zod_1.z.enum(["ADMIN", "VOTER"]),
            enrollment: zod_1.z.string(),
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
        });
        console.log(request.body);
        const body = loginBody.parse(request.body);
        const cryptoPassword = await (0, crypto_1.enCrypt)(body.password);
        const cryptoName = await (0, crypto_1.enCrypt)(body.name);
        const cryptoEnrollment = await (0, crypto_1.enCrypt)(body.enrollment);
        if (body.role === client_1.Roles.ADMIN) {
            return reply
                .status(400)
                .send({ message: "You cant assing ADMIN role to your account" });
        }
        try {
            await prisma_1.prisma.user.create({
                data: {
                    email: body.email,
                    name: cryptoName,
                    password: cryptoPassword,
                    class: body.class,
                    enrollment: cryptoEnrollment,
                    role: body.role,
                },
            });
            console.log("success");
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        }
        catch (err) {
            return reply.status(404).send({
                message: "An error ocurried",
                code: err.code,
                errorName: err.name,
            });
        }
        return reply.status(201).send("ok");
    });
}
exports.signUp = signUp;
