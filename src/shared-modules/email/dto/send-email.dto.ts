import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { EmailTemplate } from '../enums';

export class SendEmailDTO {
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsString()
  subject: string;

  @IsEnum(EmailTemplate)
  template: EmailTemplate;

  @IsString()
  message: string;
}
