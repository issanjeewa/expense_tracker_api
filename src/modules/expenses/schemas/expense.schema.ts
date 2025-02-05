import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { currencies } from 'currencies.json';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

import { Category } from 'src/modules/categories/schemas/category.schema';
import { User } from 'src/modules/users/schemas/user.schema';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({
  timestamps: true,
  id: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Expense {
  @Transform((value) => value.toString())
  _id: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    index: true,
    required: [true, 'user is required'],
    ref: User.name,
  })
  user: User;

  @Prop({
    type: SchemaTypes.ObjectId,
    index: true,
    required: [true, 'category is required'],
    ref: Category.name,
  })
  category: Category | Types.ObjectId;

  @Prop({
    required: [true, 'currency is required'],
    enum: currencies.map((currency) => currency.code),
  })
  currency: string;

  @Prop({
    required: [true, 'amount is required'],
    min: [0, 'Amount should be greater than 0'],
    type: Number,
    parseFloat: true,
  })
  amount: number;

  @Prop({
    type: String,
    required: false,
  })
  description: string;

  @Prop({
    type: Date,
    required: [true, 'Date is required'],
  })
  date: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
