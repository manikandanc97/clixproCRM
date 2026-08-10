import prisma from "@/lib/prisma";




export class LeadAttachmentService {
  static async getLeadAttachments(tenantId: string, leadId: string) {
    return prisma.attachment.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createLeadAttachment(tenantId: string, leadId: string, userId: string, data: { fileName: string, fileUrl: string, fileSize: number, fileType: string }) {
    return prisma.attachment.create({
      data: {
        tenantId,
        leadId,
        userId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async deleteLeadAttachment(tenantId: string, attachmentId: string) {
    return prisma.attachment.delete({
      where: { id: attachmentId, tenantId }
    });
  }
}


