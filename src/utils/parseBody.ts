// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function parseBody(objeto: any): Record<string, any> {
	const values = {};

	for (const key in objeto) {
		const field = objeto[key];

		if (field.type === "field") {
			values[field.fieldname] = field.value;
		}
	}

	return values;
}
