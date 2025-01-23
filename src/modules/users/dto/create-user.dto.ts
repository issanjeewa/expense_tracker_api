import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';
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

  @ApiProperty({ example: `Password@123`, required: true })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: `Password should be minimum of 8 characters that contain at least one lowercase letter, uppercase letter, number and special character`,
    },
  )
  password: string;

  @ApiProperty({ enum: Role, example: Role.USER, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
