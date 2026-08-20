import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

/**
 * @file common/encryption/encryption.module.ts
 * Global module — EncryptionService is available everywhere without re-importing.
 */
@Global()
@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
