import { Elysia, t } from "elysia";
import { handleRegister, handleLogin, handleGenerateApiKey } from "./handlers";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .post("/register", handleRegister, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/login", handleLogin, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/generate-api-key", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return handleGenerateApiKey({ user, set });
  });