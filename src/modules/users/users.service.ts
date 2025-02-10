import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { Model, isValidObjectId } from 'mongoose';

import { Events } from 'src/common/enums/events.enum';
import { AuthConfigService } from 'src/config';

import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCreatedEvent } from './events/user-created.event';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly authConfigSvc: AuthConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * ANCHOR add user
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDTO) {
    try {
      // get password hash
      const checkExists = await this.userModel.exists({
        email: createUserDto.email,
      });

      if (!!checkExists) {
        throw new ConflictException('User already exists');
      }

      const pwdHash = await bcrypt.hash(
        createUserDto.password,
        await bcrypt.genSalt(this.authConfigSvc.saltRounds),
      );

      // create 6 digit random number
      const verToken = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenHash = await bcrypt.hash(
        verToken.toString(),
        await bcrypt.genSalt(this.authConfigSvc.saltRounds),
      );

      const user = await this.userModel.create({
        ...createUserDto,
        password: pwdHash,
        verificationToken: tokenHash,
      });

      // create event
      const userCreatedEvent = new UserCreatedEvent(
        user.email,
        user.name,
        verToken,
      );

      // emit the event
      this.eventEmitter.emit(Events.USER_CREATED, userCreatedEvent);

      // return response
      return _.pick(user, ['id', 'email', 'name']);
    } catch (error) {
      this.logger.error(`Error while creating user, `, error);
      throw error;
    }
  }

  /**
   * ANCHOR verify email
   * @param userId
   * @param token
   * @returns
   */
  async verifyEmail(userId: string, token: string) {
    try {
      const user = await this.userModel
        .findOne({
          _id: userId,
          _deleted: false,
        })
        .exec();

      if (!user?.verificationToken || user?.active) {
        this.logger.error(
          `User already verified or token not found, terminating verification`,
          `userId: ${userId}`,
        );
        throw new NotFoundException('Invalid user or token');
      }

      if (!(await bcrypt.compare(token, user.verificationToken))) {
        throw new ConflictException('Invalid user or token');
      }

      user.active = true;
      user.verificationToken = null;
      await user.save();

      return _.pick(user, ['id', 'email', 'name', 'active']);
    } catch (error) {
      this.logger.error(`Error while verifying email, `, error);
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
