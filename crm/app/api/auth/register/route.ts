import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { RegisterSchema } from "@/shared/validators/auth.validator";
import { extractClientIp } from "@/shared/lib/auth/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid input data",
          details: result.error.issues.map(issue => ({
            path: issue.path,
            message: issue.message
          }))
        }
      }, { status: 400 });
    }

    const ip = extractClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const data = await AuthService.register(result.data, { ip, userAgent });

    return NextResponse.json({
      success: true,
      data,
      message: "Registration successful"
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Email already in use") {
      return NextResponse.json({
        success: false,
        error: { code: "CONFLICT", message: error.message }
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" }
    }, { status: 500 });
  }
}
