import prisma from "@/lib/prisma";




export class LeadNoteService {
  static async getLeadNotes(tenantId: string, leadId: string) {
    return prisma.note.findMany({
      where: { tenantId, leadId },
      include: {
        user: { select: { name: true, email: true, id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createLeadNote(tenantId: string, leadId: string, userId: string, data: { message: string, isPinned?: boolean, mentions?: ReturnType<typeof JSON.parse> }) {
    return prisma.note.create({
      data: {
        tenantId,
        leadId,
        userId,
        message: data.message,
        isPinned: data.isPinned || false,
        mentions: data.mentions || null
      },
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async updateLeadNote(tenantId: string, noteId: string, data: { message?: string, isPinned?: boolean }) {
    return prisma.note.update({
      where: { id: noteId, tenantId },
      data,
      include: {
        user: { select: { name: true, email: true, id: true } }
      }
    });
  }

  static async deleteLeadNote(tenantId: string, noteId: string) {
    return prisma.note.delete({
      where: { id: noteId, tenantId }
    });
  }
}


