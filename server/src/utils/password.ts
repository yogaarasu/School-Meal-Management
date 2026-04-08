import bcrypt from "bcryptjs";

export const hashPassword = async (value: string): Promise<string> => bcrypt.hash(value, 10);
export const comparePassword = async (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);