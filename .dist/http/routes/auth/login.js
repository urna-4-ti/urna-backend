"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const crypto_1 = require("../../../lib/crypto");
async function signIn(app) {
    app.post("/auth/signIn", async (request, reply) => {
        const loginBody = zod_1.z.object({
            email: zod_1.z.string().email("The field is not email"),
            password: zod_1.z
                .string()
                .min(6, "The password must be 6 characters or longer")
                .refine((password) => /[A-Z]/.test(password), "The password must contain at least one capital letter")
                .refine((password) => /[0-9]/.test(password), "The password must contain at least one number")
                .refine((password) => /[#-@]/.test(password), "The password must contain at least one of the special characters: #, -, @"),
        });
        const body = loginBody.parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });
        const isMatch = user && (await (0, crypto_1.deCrypt)(body.password, user.password));
        if (!user || !isMatch) {
            return reply.code(401).send({
                message: "Invalid credentials",
            });
        }
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
        };
        const token = request.jwt.sign(payload);
        reply.setCookie("access_token", token, {
            path: "/",
            httpOnly: true,
            secure: true,
        });
        return { accessToken: token };
    });
}
exports.signIn = signIn;
