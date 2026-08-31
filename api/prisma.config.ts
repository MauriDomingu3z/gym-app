import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`;

// schema.prisma sigue leyendo env("DATABASE_URL"); la calculamos acá a partir
// de las variables sueltas (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD) para
// no duplicar la connection string en el .env.
process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
