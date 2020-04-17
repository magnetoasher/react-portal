/** @format */

// #region Imports NPM
import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger } from '@nestjs/common';
// #endregion

export class LogService extends Logger implements TypeOrmLogger {
  locale = undefined;

  format = {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  // constructor() {
  //   super();
  // }

  log(message: any, context?: string): void {
    let m = message;
    let c = context;
    if (m === 'info') {
      m = c;
      c = 'Database: Log';
    }
    if (__DEV__) {
      super.log(m, c);
    } else {
      console.log(`${new Date().toLocaleString(this.locale, this.format)} -`, `${c} -`, m);
    }
  }

  error(message: any, trace?: object | string, context?: string): void {
    if (__DEV__) {
      if (typeof trace === 'object') {
        super.error(message, JSON.stringify(trace), context);
      } else {
        super.error(message, trace, context);
      }
    } else {
      console.error(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message, trace);
    }
  }

  warn(message: any, context?: string): void {
    if (__DEV__) {
      super.warn(message, context);
    } else {
      console.warn(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  debug(message: any, context?: string): void {
    if (__DEV__) {
      super.debug(message, context);
    } else {
      console.debug(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  verbose(message: any, context?: string): void {
    if (__DEV__) {
      super.verbose(message, context);
    } else {
      console.info(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  /**
   * From app.use(morgan('dev', { stream: logger })) - the request/response logging
   *
   * @param {string} message Message string
   */
  write(message: string): void {
    this.verbose(message.replace(/\n/, ''), 'Request');
  }

  /**
   * From TypeORM: logQuery
   */
  logQuery(message: any): void {
    this.verbose(message, 'Database: Query');
  }

  /**
   * From TypeORM: logQueryError
   */
  logQueryError(message: any, query: any, parameters: any): void {
    this.error(`${message} ${parameters}`, query);
  }

  /**
   * From TypeORM: Schema build
   */
  logSchemaBuild(message: any): void {
    this.verbose(message, 'Database: Schema build');
  }

  logMigration(message: any): void {
    this.verbose(message, 'Database: Migration');
  }

  logQuerySlow(message: any): void {
    this.verbose(message, 'Database: Slow query');
  }
}
