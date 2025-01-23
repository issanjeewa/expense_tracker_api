import { PickType } from '@nestjs/swagger';

import { CreateUserDTO } from './create-user.dto';

export class ValidateUserDTO extends PickType(CreateUserDTO, [
  'email',
  'password',
]) {}
