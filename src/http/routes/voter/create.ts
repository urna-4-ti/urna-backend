import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { FastifyInstance } from "fastify";
import { encrypt, hashing } from "../../../lib/crypto";
import type { UserJWTPayload } from "src/utils/types";

export async function createVoter(app: FastifyInstance) {
  app.post("/voter", async (request, reply) => {
    const loginBody = z.object({
      name: z.string(),
      email: z.string().email("The field is not email"),
      password: z
        .string()
        .min(6, "The password must be 10 characters")
        .max(10, "The password must be 10 characters"),
      role: z.enum(["VOTER"]),
      enrollment: z.string(),
      class: z.enum([
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

    let userJWTData: UserJWTPayload | null = null;
    try {
      const authorization = request.headers.authorization;
      const access_token = authorization?.split("Bearer ")[1];
      console.log('token', access_token);

      userJWTData = app.jwt.decode(access_token as string);
    } catch (error) {
      return reply.status(403).send({
        error: error,
        message: "Token Missing",
      });
    }
    console.log(userJWTData);

    const loggedUser = await prisma.user.findFirst({
      where: {
        email: userJWTData?.email,
      },
    });

    if (loggedUser?.role !== "ADMIN") {
      console.log(loggedUser);

      return reply.status(403).send({
        message: "Action not permitted",
      });
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const body: any = request.body;

    const fields = {
      email: body.email.value,
      password: body.password.value,
      name: body.name.value,
      class: body.class.value,
      role: body.role.value,
      enrollment: body.enrollment.value,
    };

    try {
      const data = loginBody.parse(fields);

      const cryptoPassword = await encrypt(data.password);
      const hashPassword = await hashing(data.password);
      const cryptoName = await encrypt(data.name);
      const cryptoEnrollment = await encrypt(data.enrollment);
      await prisma.user.create({
        data: {
          email: data.email,
          name: cryptoName,
          password: cryptoPassword,
          hashPassword: hashPassword,
          class: data.class,
          enrollment: cryptoEnrollment,
          role: data.role,
        },
      });
      console.log("success");

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (err: any) {
      console.error(err);
      return reply.status(404).send({
        message: err.message,
        code: err.code,
        errorName: err.name,
        error: err,
      });
    }

    return reply.status(201).send();
  });
}
