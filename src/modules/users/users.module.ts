import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';

import { AuthConfigModule } from 'src/config';
import { EmailModule } from 'src/shared-modules/email/email.module';

import { UserCreatedEventHandler } from './handlers/user-created.handler';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.plugin(mongooseLeanVirtuals);
          return schema;
        },
      },
    ]),
    AuthConfigModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserCreatedEventHandler],
  exports: [UsersService],
})
export class UsersModule {}
