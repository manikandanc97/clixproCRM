import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private googleAi;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.googleAi = createGoogleGenerativeAI({ apiKey });
    }
  }

  async generateStream(
    messages: any[],
    modelName = 'gemini-1.5-flash',
  ): Promise<any> {
    if (!this.googleAi) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured on the backend',
      );
    }

    try {
      const result = await streamText({
        model: this.googleAi(modelName),
        messages,
        temperature: 0.7,
        system: `You are an expert CRM assistant for ClixProCRM. You help users manage their pipeline, customers, and daily tasks efficiently. Maintain a professional, helpful, and concise tone.`,
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate AI stream',
        error?.toString(),
      );
    }
  }

  async generateText(messages: any[], modelName = 'gemini-1.5-flash'): Promise<any> {
    if (!this.googleAi) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured on the backend',
      );
    }

    try {
      const result = await generateText({
        model: this.googleAi(modelName),
        messages,
        temperature: 0.7,
        system: `You are an expert CRM assistant for ClixProCRM. You help users manage their pipeline, customers, and daily tasks efficiently. Maintain a professional, helpful, and concise tone.`,
      });

      return result.text;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate AI text',
        error?.toString(),
      );
    }
  }
}
