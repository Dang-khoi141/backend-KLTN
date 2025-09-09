import { UserRole } from '../../user/enums/user-role.enum';

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}
