import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DB_HOST: z.string().min(1, "DB_HOST es requerida"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1, "DB_NAME es requerida"),
  DB_USER: z.string().min(1, "DB_USER es requerida"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD es requerida"),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET es requerida"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  throw new Error("Configuración de entorno inválida");
}

const vars = parsed.data;

export const env = {
  ...vars,
  DATABASE_URL: `postgresql://${vars.DB_USER}:${vars.DB_PASSWORD}@${vars.DB_HOST}:${vars.DB_PORT}/${vars.DB_NAME}?schema=public`,
};
