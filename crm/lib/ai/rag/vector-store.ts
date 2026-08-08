import prisma from '../../prisma';
import { AIGateway } from '../gateway/gateway';

export class VectorStore {
  /**
   * Search for similar document chunks using pgvector cosine distance
   */
  static async search(tenantId: string, query: string, limit: number = 3) {
    // 1. Generate embedding for query
    const embeddings = await AIGateway.generateEmbeddings(tenantId, [query]);
    if (!embeddings || embeddings.length === 0) return [];
    
    const queryEmbedding = embeddings[0];
    
    // 2. Perform raw SQL query for vector similarity (pgvector <=> operator is cosine distance)
    // NOTE: This requires pgvector extension installed in Postgres
    const similarChunks = await prisma.$queryRaw`
      SELECT 
        dc.id, 
        dc.content, 
        d.title, 
        d."sourceUrl",
        1 - (dc.embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      WHERE d."tenantId" = ${tenantId}
      ORDER BY dc.embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;

    return similarChunks as Array<{
      id: string;
      content: string;
      title: string;
      sourceUrl: string | null;
      similarity: number;
    }>;
  }
}
