import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { CategoryType } from 'src/common/enums/categories.enum';
import { User } from 'src/modules/users/schemas/user.schema';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  id: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Transform((value) => value.toString())
  _id: string;

  @Prop({
    index: true,
    required: [true, 'Name is required'],
    trim: true,
    min: [2, 'Name should be at least 2 characters'],
    max: [255, 'Name can have only 255 characters'],
  })
  name: string;

  @Prop({
    default: CategoryType.DEFAULT,
    enum: CategoryType,
  })
  type: CategoryType;

  @Prop({
    type: SchemaTypes.ObjectId,
    index: true,
    required: false,
  })
  user?: User;

  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  _deleted: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
