import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * [story-be-production-hardening] Changed: mark routes exempt from global JwtAuthGuard (register/login/refresh/health).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
