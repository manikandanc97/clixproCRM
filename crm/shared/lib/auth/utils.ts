export interface JWTPayload {
  userId: string;
  tenantId: string;
  roleId: string;
  role?: string;
}

export function extractClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}
