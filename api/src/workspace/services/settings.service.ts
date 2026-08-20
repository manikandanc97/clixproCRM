import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';

const DEFAULT_AI_FEATURES = [
  {
    id: 'f1',
    label: 'Enable AI',
    description: 'Activate AI assistant across the platform',
    enabled: true,
  },
  {
    id: 'f2',
    label: 'Smart Reply',
    description: 'AI generated email responses',
    enabled: true,
  },
  {
    id: 'f3',
    label: 'Lead Scoring',
    description: 'Predict likelihood to close',
    enabled: true,
  },
  {
    id: 'f4',
    label: 'Meeting Summary',
    description: 'Auto-generate notes from meetings',
    enabled: false,
  },
  {
    id: 'f5',
    label: 'Email Draft',
    description: 'Draft outbound sales emails',
    enabled: true,
  },
  {
    id: 'f6',
    label: 'Task Suggestions',
    description: 'Suggest next best actions',
    enabled: false,
  },
  {
    id: 'f7',
    label: 'Knowledge Base',
    description: 'Answer support questions automatically',
    enabled: true,
  },
];

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enc: EncryptionService,
  ) {}

  async getAiSettings(tenantId: string) {
    return this.prisma.withTenantContext({ tenantId }, async (tx) => {
      const config = await tx.tenantAiConfig.findUnique({
        where: { tenantId },
      });

      const isAiEnabled = config ? config.isAiEnabled : true;
      const useRag = config ? config.useRag : true;
      const useTools = config ? config.useTools : true;

      const features = DEFAULT_AI_FEATURES.map((f) => {
        if (f.id === 'f1') return { ...f, enabled: isAiEnabled };
        if (f.id === 'f7') return { ...f, enabled: useRag };
        return { ...f };
      });

      return {
        features,
        modules: [],
        controls: [],
        provider: config?.provider || 'gemini',
        model: config?.model || 'gemini-1.5-flash',
        temperature: config?.temperature ?? 0.7,
        isAiEnabled,
        useRag,
        useTools,
        hasCustomApiKey: Boolean(config?.apiKey),
        apiKeyMasked: config?.apiKey ? '••••••••••••••••' : null,
      };
    });
  }

  async updateAiSettings(tenantId: string, data: any) {
    return this.prisma.withTenantContext({ tenantId }, async (tx) => {
      let isAiEnabled: boolean | undefined = undefined;
      let useRag: boolean | undefined = undefined;

      if (Array.isArray(data.features)) {
        const f1 = data.features.find((f: any) => f.id === 'f1');
        if (f1 && typeof f1.enabled === 'boolean') {
          isAiEnabled = f1.enabled;
        }
        const f7 = data.features.find((f: any) => f.id === 'f7');
        if (f7 && typeof f7.enabled === 'boolean') {
          useRag = f7.enabled;
        }
      }

      if (typeof data.isAiEnabled === 'boolean') {
        isAiEnabled = data.isAiEnabled;
      }
      if (typeof data.useRag === 'boolean') {
        useRag = data.useRag;
      }

      const updatePayload: any = {};
      if (isAiEnabled !== undefined) updatePayload.isAiEnabled = isAiEnabled;
      if (useRag !== undefined) updatePayload.useRag = useRag;
      if (data.model) updatePayload.model = String(data.model);
      if (typeof data.temperature === 'number') updatePayload.temperature = data.temperature;

      // Handle Bring-Your-Own-Key API Key Encryption
      if (data.apiKey !== undefined) {
        if (typeof data.apiKey === 'string' && data.apiKey.trim().length > 0 && !data.apiKey.includes('••••')) {
          updatePayload.apiKey = this.enc.encrypt(data.apiKey.trim());
        } else if (data.apiKey === null || data.apiKey === '') {
          updatePayload.apiKey = null;
        }
      }

      await tx.tenantAiConfig.upsert({
        where: { tenantId },
        update: updatePayload,
        create: {
          tenantId,
          provider: data.provider || 'gemini',
          model: data.model || 'gemini-1.5-flash',
          temperature: typeof data.temperature === 'number' ? data.temperature : 0.7,
          isAiEnabled: isAiEnabled ?? true,
          useRag: useRag ?? true,
          useTools: true,
          ...(updatePayload.apiKey !== undefined ? { apiKey: updatePayload.apiKey } : {}),
        },
      });

      return this.getAiSettings(tenantId);
    });
  }
}

