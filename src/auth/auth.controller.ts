import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExRequest } from 'express';

import { Role } from 'src/common/enums/roles.enum';

import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { User } from './decorators/user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: ExRequest) {
    return this.authService.login(req.user as CurrentUser);
  }

  @Auth(Role.ADMIN, Role.USER)
  @Get('currentuser')
  getProfile(@User() user: CurrentUser) {
    return user;
  }
}
