import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  private aiSettings = {
    features: [
      { id: 'f1', label: 'Enable AI', description: 'Activate AI assistant across the platform', enabled: true },
      { id: 'f2', label: 'Smart Reply', description: 'AI generated email responses', enabled: true },
      { id: 'f3', label: 'Lead Scoring', description: 'Predict likelihood to close', enabled: true },
      { id: 'f4', label: 'Meeting Summary', description: 'Auto-generate notes from meetings', enabled: false },
      { id: 'f5', label: 'Email Draft', description: 'Draft outbound sales emails', enabled: true },
      { id: 'f6', label: 'Task Suggestions', description: 'Suggest next best actions', enabled: false },
      { id: 'f7', label: 'Knowledge Base', description: 'Answer support questions automatically', enabled: false },
    ],
    modules: [],
    controls: [],
  };

  async getAiSettings(tenantId: string) {
    return this.aiSettings;
  }

  async updateAiSettings(tenantId: string, data: any) {
    if (data.features) {
      this.aiSettings.features = data.features;
    }
    return this.aiSettings;
  }
}
