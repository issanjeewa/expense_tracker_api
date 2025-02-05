import * as _ from 'lodash';
import { Types } from 'mongoose';

export function convertObjectIdsToStrings(obj: any): any {
  return _.transform(obj, (result, value, key) => {
    if (value instanceof Types.ObjectId) {
      result[key] = value.toString();
    } else if (_.isObject(value) && !_.isDate(value)) {
      result[key] = convertObjectIdsToStrings(value);
    } else {
      result[key] = value;
    }
  });
}
