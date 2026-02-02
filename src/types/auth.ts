export type JwtPayload = {
  sub: string;
  role: "COORDINATOR" | "STUDENT";
};
