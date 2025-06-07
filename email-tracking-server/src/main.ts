import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@exceptions/exception.filter';
import { APP_PORT } from '@environments';
import { CustomLoggerService } from '@logger/logger.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new CustomLoggerService(),
    cors: true,
  });

  app.use(cookieParser());
  // app.enableCors({
  //   origin: [
  //     'chrome-extension://nolapbheihcobdcjflnkjbkpkelelfcn',
  //     'http://localhost:3000',
  //     'https://mail.google.com',
  //     'https://ai-powered-gmail.vercel.app',
  //   ],
  //   credentials: true,
  // });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('AI-Powered Gmail API Docs')
    .setDescription('The AI-Powered Gmail API Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(APP_PORT);

  console.log(
    '\x1b[36m',
    `\nServer listening on: http://localhost:${APP_PORT}\nAPI docs: http://localhost:${APP_PORT}/docs`,
  );
}
bootstrap();
