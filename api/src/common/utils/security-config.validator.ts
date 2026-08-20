import { Logger } from '@nestjs/common';

export interface SecurityConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SecurityConfigValidator {
  private static readonly logger = new Logger(SecurityConfigValidator.name);

  static validateEnvironment(): SecurityConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Mandatory Core Variables
    const requiredVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    for (const v of requiredVars) {
      const val = process.env[v];
      if (!val || val.trim() === '') {
        errors.push(`Missing mandatory environment variable: ${v}`);
      } else if (val.includes('placeholder') || val.includes('your-secret-here') || val.includes('changeme')) {
        errors.push(`Insecure placeholder value detected in variable: ${v}`);
      }
    }

    // 2. Audit HMAC Secret Validation
    const hmacSecret = process.env.AUDIT_HMAC_SECRET;
    if (isProduction && (!hmacSecret || hmacSecret.length < 32)) {
      warnings.push('AUDIT_HMAC_SECRET is recommended to be at least 32 characters long in production.');
    }

    // 3. Database URL Security Check
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string.');
    }

    // 4. Supabase URL Check
    const sbUrl = process.env.SUPABASE_URL || '';
    if (sbUrl && !sbUrl.startsWith('http://') && !sbUrl.startsWith('https://')) {
      errors.push('SUPABASE_URL must be a valid HTTP/HTTPS URL.');
    }

    if (errors.length > 0) {
      this.logger.error(`[SECURITY CONFIG ERROR] Found ${errors.length} configuration violation(s): \n - ${errors.join('\n - ')}`);
    }

    if (warnings.length > 0) {
      this.logger.warn(`[SECURITY CONFIG WARNING] \n - ${warnings.join('\n - ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
