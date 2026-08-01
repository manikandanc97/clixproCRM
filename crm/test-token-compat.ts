import { signJWT } from './shared/lib/auth/jwt';
import jwt from 'jsonwebtoken';
import { env } from './lib/env';

async function main() {
  try {
    const payload = { userId: '123', tenantId: '456', roleId: '789', role: 'ADMIN' };
    const token = await signJWT(payload);
    
    console.log("Token:", token);
    const decoded = jwt.verify(token, env.JWT_SECRET);
    console.log("Decoded:", decoded);
  } catch (err) {
    console.error("Error verifying:", err);
  }
}
main();
