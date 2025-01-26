import {
  ClassSerializerInterceptor,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';
import {
  ClassTransformOptions,
  instanceToInstance,
  instanceToPlain,
} from 'class-transformer';
import { Document } from 'mongoose';

@Injectable()
export class ResponseSerializerInterceptor extends ClassSerializerInterceptor {
  private changeInstanceToPlainObject(data: PlainLiteralObject) {
    if (!(data instanceof Document)) {
      return instanceToInstance(data, { excludePrefixes: ['_'] });
    }
    return instanceToPlain(data.toJSON(), { excludePrefixes: ['_'] });
  }

  private prepareResponse(response: PlainLiteralObject | PlainLiteralObject[]) {
    if (Array.isArray(response)) {
      return response.map(this.changeInstanceToPlainObject);
    }
    return this.changeInstanceToPlainObject(response);
  }

  serialize(
    response: PlainLiteralObject | PlainLiteralObject[],
    options: ClassTransformOptions,
  ) {
    return super.serialize(this.prepareResponse(response), options);
  }
}
