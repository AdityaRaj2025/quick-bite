import { FastifyInstance } from "fastify";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, role, restaurantId } = req.body as any;
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (existing) return res.conflict("Email in use");
    const [row] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashPassword(password),
        role: role ?? "owner",
        restaurantId: restaurantId ?? null,
      })
      .returning();
    return { id: row.id, email: row.email };
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body as any;
    const u = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, email),
    });
    if (!u || u.passwordHash !== hashPassword(password))
      return res.unauthorized("Invalid credentials");
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      restaurantId: u.restaurantId,
    };
  });
}
