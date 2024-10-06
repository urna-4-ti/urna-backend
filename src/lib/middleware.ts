import type { FastifyInstance, FastifyRequest } from "fastify";

interface FileRequest extends FastifyRequest {
	fileData?: {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		file: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		formFields: any;
	};
}

export async function fileMiddleware(app: FastifyInstance) {
	app.addHook("preHandler", async (req: FileRequest, reply) => {
		if (req.isMultipart()) {
			const file = await req.file();
			const formFields = req.body;

			// Processa os campos do formulário e o arquivo
			req.fileData = {
				file,
				formFields,
			};
		}
	});
}
