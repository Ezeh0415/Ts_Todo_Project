const z = require("zod");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const configSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  DB_URL: z.string().url(),
  HASH_SALT: z.coerce.number(),
  JWT_TOKEN_KEY: z.string(),
  JWT_REFRESH_TOKEN_KEY: z.string(),
  JWT_TOKEN_EXPIRE: z.string(),
  JWT_REFRESH_TOKEN_EXPIRE: z.string(),
});

const config = configSchema.parse(process.env);

module.exports = config;
