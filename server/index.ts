import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./src/api/auth.routes";
import { marketRoutes } from "./src/api/markets.routes";
import { jwtPlugin } from "./src/plugins/jwt";
import { eq } from "drizzle-orm";
import db from "./src/db";
import { usersTable } from "./src/db/schema";

const PORT = Number(process.env.PORT || 4001);
const HOST = process.env.HOST || "0.0.0.0";

export const app = new Elysia()
  .use(
    cors({
      origin: "*",
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    }),
  )
  .use(jwtPlugin)
  .derive(async ({ headers, jwt }) => {
    const apiKey = headers["x-api-key"];
    if (apiKey) {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.apiKey, apiKey));
      if (user) {
        return { user };
      }
    }

    const auth = headers["authorization"];
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const payload = await jwt.verify(token);
      if (payload && payload.userId) {
        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, payload.userId as number),
        });
        if (user) {
          return { user };
        }
      }
    }
    return { user: null };
  })
  .onError(({ code, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Invalid request" };
    }
  })
  .use(authRoutes)
  .use(marketRoutes);

if (import.meta.main) {
  app.listen({
    port: PORT,
    hostname: HOST,
  });
  console.log(`Server running at http://${HOST}:${PORT}`);
}