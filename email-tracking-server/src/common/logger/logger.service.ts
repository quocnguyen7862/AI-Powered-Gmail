import { Injectable, LoggerService } from '@nestjs/common';
import winston, { Logger } from 'winston';
import { winstonConfig } from './logger.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = winston.createLogger(winstonConfig);
  }

  log(message: any) {
    this.logger.info(message);
  }

  error(message: any, trace: string) {
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: any) {
    this.logger.warn(message);
  }

  debug?(message: any) {
    this.logger.debug(message);
  }

  verbose?(message: any) {
    this.logger.verbose(message);
  }
}
