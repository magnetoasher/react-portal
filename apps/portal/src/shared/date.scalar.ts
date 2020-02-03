/** @format */

// #region Imports NPM
import { Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
// #endregion

// TODO: внести в env формат даты
@Scalar('Date')
export class DateScalar {
  description = 'Date scalar type';

  parseValue(value: any): Date {
    return new Date(value);
  }

  serialize(value: Date | string): Date | string {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value.toLocaleString();
  }

  parseLiteral(ast: any): any {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
}
