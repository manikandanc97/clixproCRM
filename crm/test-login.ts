import { AuthService } from "./services/auth.service";

async function main() {
  try {
    const res = await AuthService.login({ email: "admin@admin.com", password: "password" }, {});
    console.log("SUCCESS:", res);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
