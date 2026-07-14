import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { appConfig } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Set global prefix to match the OpenAPI contract
  app.setGlobalPrefix('api/');

  // Swagger Configuration
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

  app.enableCors({ origin: appConfig.corsOrigins });

  await app.listen(appConfig.port);
  console.log(`Application is running on: http://localhost:${appConfig.port}/api`);
  console.log(`Swagger documentation is available at: http://localhost:${appConfig.port}/docs`);
  console.log(`CORS origins: ${appConfig.corsOrigins.join(', ')}`);
}
bootstrap();
