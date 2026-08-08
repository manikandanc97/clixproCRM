import { NextResponse } from "next/server";
import { CompanyService } from "@/services";
import { getAuthSession, requireRole } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    const params = await context.params;
    const company = await CompanyService.getCompanyById(session.tenantId, params.id);
    if (!company) return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, data: company }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    const params = await context.params;
    const data = await req.json();
    const updated = await CompanyService.updateCompany(session.tenantId, params.id, data);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    const params = await context.params;
    await CompanyService.deleteCompany(session.tenantId, params.id);
    return NextResponse.json({ success: true, message: "Company deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
