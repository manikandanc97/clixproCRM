import { crmTools } from './crm-tools';

export class ToolRegistry {
  /**
   * Returns all available tools for a specific tenant and user context.
   * This ensures tools are bounded by tenant logic.
   */
  static getTools(tenantId: string, userId: string) {
    return {
      ...crmTools(tenantId, userId),
      // Add HR tools, Support tools, etc. here in the future
    };
  }
}
