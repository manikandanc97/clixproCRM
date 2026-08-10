import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const subject = formData.get("subject") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const description = formData.get("description") as string;
    const diagnosticsStr = formData.get("diagnostics") as string;
    const files = formData.getAll("attachments") as File[];
    
    const diagnostics = diagnosticsStr ? JSON.parse(diagnosticsStr) : {};
    
    // Generate unique ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const ticketId = `CRM-${year}-${randomNum}`;
    
    // Prepare attachments for nodemailer
    const attachments = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          filename: file.name,
          content: buffer,
        };
      })
    );
    
    // Calculate total attachment size
    const totalSize = attachments.reduce((acc, curr) => acc + curr.content.length, 0);
    const maxSize = 25 * 1024 * 1024; // 25MB for SMTP limits
    
    if (totalSize > maxSize) {
      console.warn(`Attachments total size (${totalSize} bytes) exceeds SMTP limit of 25MB. Some files might be rejected by the provider.`);
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Clixpro CRM Support Ticket</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Priority:</strong> <span style="background-color: ${priority === 'Critical' ? '#ef4444' : priority === 'High' ? '#f97316' : '#eab308'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${priority}</span></p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 4px; white-space: pre-wrap;">
            <strong>Description:</strong><br/>
            ${description}
          </div>
          
          <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">User & System Diagnostics</h3>
          <table style="width: 100%; font-size: 13px; text-align: left; border-collapse: collapse;">
            <tbody>
              <tr><th style="padding: 4px;">User Name:</th><td>${diagnostics.currentUserName}</td></tr>
              <tr><th style="padding: 4px;">Email:</th><td>${diagnostics.email}</td></tr>
              <tr><th style="padding: 4px;">Role:</th><td>${diagnostics.role}</td></tr>
              <tr><th style="padding: 4px;">Current URL:</th><td>${diagnostics.currentUrl}</td></tr>
              <tr><th style="padding: 4px;">Browser:</th><td>${diagnostics.browser}</td></tr>
              <tr><th style="padding: 4px;">OS:</th><td>${diagnostics.operatingSystem}</td></tr>
              <tr><th style="padding: 4px;">Device:</th><td>${diagnostics.deviceType}</td></tr>
              <tr><th style="padding: 4px;">Resolution:</th><td>${diagnostics.screenResolution}</td></tr>
              <tr><th style="padding: 4px;">Timezone:</th><td>${diagnostics.timezone}</td></tr>
              <tr><th style="padding: 4px;">App Version:</th><td>${diagnostics.appVersion}</td></tr>
              <tr><th style="padding: 4px;">Submitted At:</th><td>${diagnostics.timestamp}</td></tr>
            </tbody>
          </table>
          
          <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
            <em>Attachments: ${attachments.length} files included.</em>
          </p>
        </div>
      </div>
    `;

    // Send Mail only if SMTP variables exist (otherwise simulate success for development)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"Clixpro Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: "manibct1817@gmail.com",
        subject: `[ClientRise CRM] Support Ticket #${ticketId}`,
        html: htmlContent,
        attachments,
      });
    } else {
      // Log email attempt safely
    }

    return NextResponse.json({ 
      success: true, 
      ticketId, 
      estimatedResponseTime: "Within 24 hours" 
    });

  } catch (error) {
    console.error("Support Ticket API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process ticket" },
      { status: 500 }
    );
  }
}
