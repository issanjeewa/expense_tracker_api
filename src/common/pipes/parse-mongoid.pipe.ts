import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any) {
    if (isMongoId(value)) {
      return value;
    } else {
      throw new BadRequestException(`${value} is not a valid id`);
    }
  }
}
