import { Role } from 'src/common/enums/roles.enum';

export type CurrentUser = {
  email: string;
  name: string;
  role: Role;
  id: string;
  active: boolean;
};
