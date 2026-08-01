import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { ProjectsModule } from './module/projects/projects.module';
import { ScriptsModule } from './module/scripts/scripts.module';
import { FramesModule } from './module/frames/frames.module';
import { SpeechBubblesModule } from './module/speech-bubbles/speech-bubbles.module';
import { GenerationJobsModule } from './module/generation-jobs/generation-jobs.module';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './module/auth/guards/jwt-auth.guard';

@Module({
  imports: [UsersModule,
    ProjectsModule,
    ScriptsModule,
    FramesModule,
    SpeechBubblesModule,
    GenerationJobsModule,
    AuthModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: false,
        migrations: [__dirname + '/db/migrations/*.{js,ts}'],
        /**
         * [story-be-production-hardening] Changed: auto-run migrations only outside production.
         */
        migrationsRun: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
