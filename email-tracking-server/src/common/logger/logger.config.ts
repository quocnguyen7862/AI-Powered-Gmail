import { format, transports } from 'winston';
import { NODE_ENV } from '@environments';
import { join } from 'path';

const isProduction = NODE_ENV === 'production';

const fileTransport = new transports.File({
  filename: isProduction ? 'production.log' : 'development.log',
  dirname: join(__dirname, '../../logs'),
});

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), format.simple()),
});

export const winstonConfig = {
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: isProduction
    ? [fileTransport]
    : [fileTransport, consoleTransport],
};
