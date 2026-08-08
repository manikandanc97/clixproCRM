import { AIGateway } from '../gateway/gateway';
import prisma from '../../prisma';

export class EmbeddingService {
  /**
   * Split text into overlapping chunks
   */
  static chunkText(text: string, maxTokens: number = 500): string[] {
    // Simple naive chunking by paragraphs for demonstration
    // In production, use Langchain's RecursiveCharacterTextSplitter
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
      if (currentChunk.length + p.length > maxTokens * 4) { // rough estimate 1 token = 4 chars
        chunks.push(currentChunk);
        currentChunk = p;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + p;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    
    return chunks;
  }

  /**
   * Ingest a document, chunk it, generate embeddings, and save to database
   */
  static async ingestDocument(tenantId: string, title: string, content: string, sourceUrl?: string) {
    const chunks = this.chunkText(content);
    
    const doc = await prisma.document.create({
      data: {
        tenantId,
        title,
        content,
        sourceUrl
      }
    });

    const embeddings = await AIGateway.generateEmbeddings(tenantId, chunks);

    // Save chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = embeddings[i];
      
      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, "createdAt")
        VALUES (
          gen_random_uuid(), 
          ${doc.id}, 
          ${chunkText}, 
          ${embedding}::vector, 
          NOW()
        )
      `;
    }

    return doc;
  }
}
