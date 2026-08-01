import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { appConfig, jwtConfig } from './common/config';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * [story-p0-be-security-payment] Changed: fail fast when JWT_SECRET missing in production.
 */
function validateJwtSecret(): void {
  if (appConfig.isProduction && !jwtConfig.secret) {
    throw new Error(
      'JWT_SECRET is required when NODE_ENV=production. Set it in .env before starting the server.',
    );
  }
}

async function bootstrap() {
  validateJwtSecret();

  const app = await NestFactory.create(AppModule, { bodyParser: false });
  /**
   * [story-be-production-hardening] Changed: Helmet security headers on all HTTP responses.
   */
  app.use(helmet());
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('api/');

  /**
   * [story-be-production-hardening] Changed: Swagger disabled when NODE_ENV=production.
   */
  if (!appConfig.isProduction) {
    const config = new DocumentBuilder()
      .setTitle('ComicSystem Public API')
      .setDescription(
        'API công khai duy nhất mà fe-comic được phép gọi. Mọi logic AI nằm sau be-comic — client không biết orchestrator/story/image.',
      )
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors({ origin: appConfig.corsOrigins });

  await app.listen(appConfig.port);
  console.log(
    `Application is running on: http://localhost:${appConfig.port}/api`,
  );
  if (!appConfig.isProduction) {
    console.log(
      `Swagger documentation is available at: http://localhost:${appConfig.port}/docs`,
    );
  }
  console.log(`CORS origins: ${appConfig.corsOrigins.join(', ')}`);
}
bootstrap();
