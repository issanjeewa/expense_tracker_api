import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import * as _ from 'lodash';

import { Role } from 'src/common/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => _.chain(value).trim().toLower().value())
  email: string;

  @ApiProperty({ example: 'John Doe', required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Role, example: Role.USER, required: false })
  @IsEnum(Role)
  role?: Role;
}
