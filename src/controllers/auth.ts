import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { registerSchema, loginSchema } from "../validators/auth";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password, role } = parsed.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: "Email already registered." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role ?? "STUDENT",
    },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return res.status(201).json({ token, role: user.role });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = signToken({ sub: user.id, role: user.role });
  return res.status(200).json({ token, role: user.role });
};
