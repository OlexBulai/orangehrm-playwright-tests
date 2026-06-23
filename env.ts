import dotenv from 'dotenv';

dotenv.config();

export const usernameLogin = process.env.USERNAME_LOGIN!;
export const passwordLogin = process.env.PASSWORD_LOGIN!;
export const baseUrl = process.env.BASE_URL!;
