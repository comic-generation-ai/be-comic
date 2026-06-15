import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { ProjectsModule } from './module/projects/projects.module';
import { ScriptsModule } from './module/scripts/scripts.module';
import { TransactionsModule } from './module/transactions/transactions.module';
import { CharactersModule } from './module/characters/characters.module';
import { FramesModule } from './module/frames/frames.module';
import { SpeechBubblesModule } from './module/speech-bubbles/speech-bubbles.module';
import { GenerationJobsModule } from './module/generation-jobs/generation-jobs.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UsersModule,
    ProjectsModule,
    ScriptsModule,
    TransactionsModule,
    CharactersModule,
    FramesModule,
    SpeechBubblesModule,
    GenerationJobsModule,
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
        migrationsRun: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
