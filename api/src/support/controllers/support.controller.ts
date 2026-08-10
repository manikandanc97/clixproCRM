import { Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { SupportService } from '../services/support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  async createTicket(@Req() req: any, @Res() res: any) {
    try {
      const fastifyReq = req as any;
      if (!fastifyReq.isMultipart()) {
        return res.status(400).send({ success: false, message: 'Request must be multipart' });
      }

      let subject = '';
      let category = '';
      let priority = '';
      let description = '';
      let diagnosticsStr = '';
      const attachments: { filename: string; content: Buffer }[] = [];

      const parts = fastifyReq.parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          attachments.push({ filename: part.filename, content: buffer });
        } else {
          if (part.fieldname === 'subject') subject = part.value as string;
          if (part.fieldname === 'category') category = part.value as string;
          if (part.fieldname === 'priority') priority = part.value as string;
          if (part.fieldname === 'description') description = part.value as string;
          if (part.fieldname === 'diagnostics') diagnosticsStr = part.value as string;
        }
      }

      const diagnostics = diagnosticsStr ? JSON.parse(diagnosticsStr) : {};
      
      const data = await this.supportService.sendSupportTicket(
        subject,
        category,
        priority,
        description,
        diagnostics,
        attachments
      );

      return res.status(200).send({
        success: true,
        ticketId: data.ticketId,
        estimatedResponseTime: data.estimatedResponseTime,
      });
    } catch (error: any) {
      console.error('Support Ticket API Error:', error);
      throw new HttpException(
        { success: false, error: 'Failed to process ticket' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
