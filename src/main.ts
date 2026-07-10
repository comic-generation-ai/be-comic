import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/docs`);
}
bootstrap();
