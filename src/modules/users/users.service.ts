import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, isValidObjectId } from 'mongoose';

import { AuthConfigService } from 'src/config';

import { CreateUserDTO } from './dto/create-user.dto';
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
  async create(createUserDto: CreateUserDTO) {
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

  /**
   * ANCHOR fetch one user
   * @param uniqId
   * @returns
   */
  async findOne(uniqId: string) {
    try {
      const user = await this.userModel
        .findOne({
          ...(isValidObjectId(uniqId) ? { _id: uniqId } : { email: uniqId }),
          _deleted: false,
        })
        .lean()
        .exec();

      if (!user) throw new NotFoundException();

      return user;
    } catch (error) {
      this.logger.error(`Error while validating user, `, error);
      throw error;
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user ${updateUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
