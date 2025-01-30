import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDTO {
  @ApiProperty({ type: String })
  @IsString()
  token: string;
}
