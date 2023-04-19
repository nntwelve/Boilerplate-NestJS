import { SetMetadata } from '@nestjs/common';

export const ROLES = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);
