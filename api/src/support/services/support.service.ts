import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendSupportTicket(
    subject: string,
    category: string,
    priority: string,
    description: string,
    diagnostics: any,
    attachments: { filename: string; content: Buffer }[],
  ) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0');
    const ticketId = `CRM-${year}-${randomNum}`;

    const safeSubject = escapeHtml(subject);
    const safeCategory = escapeHtml(category);
    const safePriority = escapeHtml(priority);
    const safeDescription = escapeHtml(description);

    const safeDiagnostics = {
      currentUserName: escapeHtml(diagnostics?.currentUserName || 'N/A'),
      email: escapeHtml(diagnostics?.email || 'N/A'),
      userId: escapeHtml(diagnostics?.userId || 'N/A'),
      role: escapeHtml(diagnostics?.role || 'N/A'),
      currentUrl: escapeHtml(diagnostics?.currentUrl || 'N/A'),
      browser: escapeHtml(diagnostics?.browser || 'N/A'),
      operatingSystem: escapeHtml(diagnostics?.operatingSystem || 'N/A'),
      deviceType: escapeHtml(diagnostics?.deviceType || 'N/A'),
      screenResolution: escapeHtml(diagnostics?.screenResolution || 'N/A'),
      timezone: escapeHtml(diagnostics?.timezone || 'N/A'),
      appVersion: escapeHtml(diagnostics?.appVersion || 'N/A'),
      timestamp: escapeHtml(diagnostics?.timestamp || new Date().toISOString()),
    };

    const priorityColor =
      priority === 'Critical'
        ? '#ef4444'
        : priority === 'High'
          ? '#f97316'
          : '#eab308';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Clixpro CRM Support Ticket</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p><strong>Ticket ID:</strong> ${escapeHtml(ticketId)}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Category:</strong> ${safeCategory}</p>
          <p><strong>Priority:</strong> <span style="background-color: ${priorityColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${safePriority}</span></p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 4px; white-space: pre-wrap;">
            <strong>Description:</strong><br/>
            ${safeDescription}
          </div>
          
          <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">User & System Diagnostics</h3>
          <table style="width: 100%; font-size: 13px; text-align: left; border-collapse: collapse;">
            <tbody>
              <tr><th style="padding: 4px;">User Name:</th><td>${safeDiagnostics.currentUserName}</td></tr>
              <tr><th style="padding: 4px;">Email:</th><td>${safeDiagnostics.email}</td></tr>
              <tr><th style="padding: 4px;">User ID:</th><td>${safeDiagnostics.userId}</td></tr>
              <tr><th style="padding: 4px;">Role:</th><td>${safeDiagnostics.role}</td></tr>
              <tr><th style="padding: 4px;">Current URL:</th><td>${safeDiagnostics.currentUrl}</td></tr>
              <tr><th style="padding: 4px;">Browser:</th><td>${safeDiagnostics.browser}</td></tr>
              <tr><th style="padding: 4px;">OS:</th><td>${safeDiagnostics.operatingSystem}</td></tr>
              <tr><th style="padding: 4px;">Device:</th><td>${safeDiagnostics.deviceType}</td></tr>
              <tr><th style="padding: 4px;">Resolution:</th><td>${safeDiagnostics.screenResolution}</td></tr>
              <tr><th style="padding: 4px;">Timezone:</th><td>${safeDiagnostics.timezone}</td></tr>
              <tr><th style="padding: 4px;">App Version:</th><td>${safeDiagnostics.appVersion}</td></tr>
              <tr><th style="padding: 4px;">Submitted At:</th><td>${safeDiagnostics.timestamp}</td></tr>
            </tbody>
          </table>
          
          <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
            <em>Attachments: ${attachments.length} files included.</em>
          </p>
        </div>
      </div>
    `;

    const supportRecipient =
      process.env.SUPPORT_EMAIL || 'support@clixprocrm.com';

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        await this.transporter.sendMail({
          from: `"Clixpro Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: supportRecipient,
          subject: `[ClixProCRM Support] #${ticketId} - ${subject.slice(0, 80)}`,
          html: htmlContent,
          attachments,
        });
      } catch (mailError: any) {
        this.logger.error(
          `Failed to deliver support email for ticket ${ticketId}: ${mailError?.message || mailError}`,
        );
      }
    } else {
      this.logger.warn('SMTP configuration not found, skipping email dispatch.');
    }

    return { ticketId, estimatedResponseTime: 'Within 24 hours' };
  }
}
