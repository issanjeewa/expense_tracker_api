import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { AuthConfigService } from 'src/config';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly authConfigSvc: AuthConfigService,
  ) {}

  /**
   * ANCHOR add user
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    try {
      // get password hash
      const salt = await bcrypt.genSalt(this.authConfigSvc.saltRounds);
      const pwdHash = await bcrypt.hash(createUserDto.password, salt);

      const user = await this.userModel.create({
        ...createUserDto,
        password: pwdHash,
      });
      return user;
    } catch (error) {
      this.logger.error(`Error while creating user, `, error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
