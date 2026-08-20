import { SecurityConfigValidator } from '../common/utils/security-config.validator';

describe('P7 Production Security & Configuration Readiness Suite', () => {
  describe('1. Production Configuration Check', () => {
    it('detects insecure placeholder secrets and reports sanitized error without leaking secrets', () => {
      const originalEnv = { ...process.env };
      process.env.DATABASE_URL = 'postgres://user:password_placeholder@localhost:5432/db';
      process.env.SUPABASE_URL = 'http://placeholder.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'placeholder_key';

      const validation = SecurityConfigValidator.validateEnvironment();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.toLowerCase().includes('insecure placeholder'))).toBe(true);

      // Verify validation output does not contain raw passwords
      for (const err of validation.errors) {
        expect(err).not.toContain('password_placeholder');
      }

      process.env = originalEnv;
    });
  });
});
