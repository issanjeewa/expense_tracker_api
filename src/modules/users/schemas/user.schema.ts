import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { Role } from 'src/common/enums/roles.enum';
import { Category } from 'src/modules/categories/schemas/category.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  id: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Transform(({ value }) => value.toString())
  readonly _id: string;

  @Prop({
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Please enter an email'],
    index: true,
  })
  email: string;

  @Prop({
    index: true,
    trim: true,
    required: [true, 'Please enter a name'],
    min: [2, 'Name should be at least 2 characters'],
    max: [255, 'Name can have only 255 characters'],
  })
  name: string;

  @Prop({
    default: Role.USER,
    enum: Role,
  })
  role: Role;

  @Prop({
    select: false,
    required: [true, 'Please enter a password'],
  })
  password: string;

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: Category.name,
    required: false,
  })
  categories: Array<Category>;
}

export const UserSchema = SchemaFactory.createForClass(User);
