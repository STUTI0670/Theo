import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types/auth";

export const signToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwtSecret as Secret, options);
};
