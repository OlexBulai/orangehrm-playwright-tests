import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const usernameLogin = requireEnv('USERNAME_LOGIN');
export const passwordLogin = requireEnv('PASSWORD_LOGIN');
export const baseUrl = requireEnv('BASE_URL');
