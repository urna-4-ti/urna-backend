import * as bcrypt from "bcrypt";

export async function enCrypt(data: string) {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(data, salt);
}

export async function deCrypt(data: string, has: string) {
	return await bcrypt.compare(data, has);
}
