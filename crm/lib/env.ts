const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is not defined. Application cannot start.");
}

export const env = {
  JWT_SECRET,
};
