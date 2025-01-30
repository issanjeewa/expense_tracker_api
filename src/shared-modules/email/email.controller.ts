import { Body, Controller, Post } from '@nestjs/common';

import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private service: EmailService) {}

  @Post()
  testEmail(@Body() body: any) {
    return this.service.sendEmail(body);
  }
}
