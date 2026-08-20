import { SetMetadata } from '@nestjs/common';

export const REQUIRE_AAL_KEY = 'require_aal';
export const RequireAal = (level: 'aal1' | 'aal2' = 'aal2') =>
  SetMetadata(REQUIRE_AAL_KEY, level);
