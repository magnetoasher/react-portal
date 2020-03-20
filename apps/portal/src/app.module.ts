/** @format */
/* eslint spaced-comment:0 */
/// <reference types="../../../typings/global" />

// #region Imports NPM
import { resolve } from 'path';
// import { APP_FILTER } from '@nestjs/core';
import { Module, CacheModule } from '@nestjs/common';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  I18nJsonParser,
  CookieResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RenderModule } from 'nest-next-2';
import redisCacheStore from 'cache-manager-redis-store';
import { TerminusModule, TypeOrmHealthIndicator, TerminusModuleOptions } from '@nestjs/terminus';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule, LogService } from '@app/logger';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { CacheInterceptorProvider } from '@app/cache.interceptor';
// import { HttpErrorFilter } from './filters/http-error.filter';
import { DateScalar } from './shared/date.scalar';
import { ByteArrayScalar } from './shared/bytearray.scalar';
import { ControllersModule } from './controllers/controllers.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NewsModule } from './news/news.module';
import { ProfileModule } from './profile/profile.module';
import { ProfileEntity } from './profile/profile.entity';
import { UserEntity } from './user/user.entity';
import { GroupModule } from './group/group.module';
import { GroupEntity } from './group/group.entity';
import { TicketDepartmentModule } from './ticket/department/department.module';
import { TicketServiceModule } from './ticket/service/service.module';
import { TicketGroupServiceModule } from './ticket/group-service/group-service.module';
import { TicketsModule } from './ticket/tickets/tickets.module';
import { TicketAttachmentsModule } from './ticket/attachments/attachments.module';
import { TicketCommentsModule } from './ticket/comments/comments.module';
import { TicketOldServiceModule } from './ticket/old-service/old-service.module';
import { NewsEntity } from './news/news.entity';
import { FilesModule } from './files/files.module';
import { FilesFolderEntity } from './files/files.folder.entity';
import { FilesEntity } from './files/files.entity';
import { Upload } from './shared/upload.scalar';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../../..') : '../..', '.env');

const getTerminusOptions = (db: TypeOrmHealthIndicator): TerminusModuleOptions => ({
  endpoints: [
    {
      // The health check will be available with /health
      url: '/health',
      // All the indicator which will be checked when requesting /health
      healthIndicators: [
        // Set the timeout for a response to 400ms
        async () => db.pingCheck('database', { timeout: 400 }),
      ],
    },
  ],
});

@Module({
  imports: [
    // #region Logging module
    LoggerModule,
    // #endregion

    // #region Config module
    ConfigModule.register(env),
    // #endregion

    // #region Next RenderModule
    RenderModule,
    // #endregion

    // #region Cache Manager - Redis
    CacheModule.registerAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LogService],
      useFactory: async (configService: ConfigService, logService: LogService) => {
        logService.debug(
          `install cache: ` +
            `url="${configService.get('HTTP_REDIS_URI')}", ` +
            `ttl=${configService.get('HTTP_REDIS_TTL')}s, ` +
            `max objects=${configService.get('HTTP_REDIS_MAX_OBJECTS')} `,
          'Cache',
        );

        return {
          store: redisCacheStore,
          ttl: configService.get<number>('HTTP_REDIS_TTL'), // seconds
          max: configService.get<number>('HTTP_REDIS_MAX_OBJECTS'), // maximum number of items in cache
          url: configService.get<string>('HTTP_REDIS_URI'),
          // retry_strategy: (options) => {}
        };
      },
    }),
    // #endregion

    // #region Locale I18n
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      parser: I18nJsonParser,
      useFactory: async (configService: ConfigService) => ({
        parserOptions: {
          path: configService.i18nPath,
        },
        fallbackLanguage: configService.fallbackLanguage,
        resolvers: [
          { use: QueryResolver, options: ['lang', 'locale', 'l'] },
          new HeaderResolver(),
          AcceptLanguageResolver,
          new CookieResolver(['lang', 'locale', 'l']),
        ],
      }),
    }),
    // #endregion

    // #region GraphQL
    Upload,
    GraphQLModule.forRoot({
      debug: dev,
      playground: dev
        ? {
            settings: {
              // Когда в playground режиме, нажмите settings и добавте строку:
              'request.credentials': 'same-origin',
            },
          }
        : false,
      typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
      uploads: {
        maxFileSize: 100000000, // 100MB
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    // #endregion

    // #region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LogService],
      useFactory: async (configService: ConfigService, logger: LogService) => {
        logger.debug(
          `Replication: ` +
            `master url="${configService.get<string>('DATABASE_URI')}, ` +
            `slave url="${configService.get<string>('DATABASE_URI_RD')}. ` +
            `Cache url="${configService.get<string>('DATABASE_REDIS_URI')}", ` +
            `ttl=${configService.get<number>('DATABASE_REDIS_TTL')}ms.`,
          'Database',
        );

        return {
          name: 'default',
          keepConnectionAlive: true,
          type: 'postgres',
          replication: {
            master: { url: configService.get<string>('DATABASE_URI') },
            slaves: [{ url: configService.get<string>('DATABASE_URI_RD') }],
          },
          schema: configService.get<string>('DATABASE_SCHEMA'),
          uuidExtension: 'pgcrypto',
          logger,
          synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
          dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
          logging: dev
            ? true
            : configService.get('DATABASE_LOGGING') === 'false'
            ? false
            : configService.get('DATABASE_LOGGING') === 'true'
            ? true
            : JSON.parse(configService.get('DATABASE_LOGGING')),
          entities: [
            ProfileEntity,
            GroupEntity,
            UserEntity,
            NewsEntity,
            FilesFolderEntity,
            FilesEntity,
            TicketDepartmentModule,
            TicketGroupServiceModule,
            TicketServiceModule,
            TicketsModule,
            TicketAttachmentsModule,
            TicketCommentsModule,
          ],
          migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
          cache: {
            type: 'redis', // "ioredis/cluster"
            options: {
              url: configService.get<string>('DATABASE_REDIS_URI'),
              scaleReads: 'slave',
            },
            alwaysEnabled: true,
            /**
             * Time in milliseconds in which cache will expire.
             * This can be setup per-query.
             * Default value is 1000 which is equivalent to 1 second.
             */
            duration: configService.get<number>('DATABASE_REDIS_TTL'),
            max: 10000,
          },
        } as TypeOrmModuleOptions;
      },
    }),
    // #endregion

    // #region Profile
    ProfileModule,
    // #endregion

    // #region Authentication
    AuthModule,
    // #endregion

    // #region Groups
    GroupModule,
    // #endregion

    // #region Users
    UserModule,
    // #endregion

    // #region News
    NewsModule,
    // #endregion

    // #region Controllers module
    ControllersModule,
    // #endregion

    // #region Ticket module
    TicketDepartmentModule,
    TicketServiceModule,
    TicketGroupServiceModule,
    TicketsModule,
    TicketAttachmentsModule,
    TicketCommentsModule,
    TicketOldServiceModule,
    // #endregion

    // #region Files module
    FilesModule,
    // #endregion

    // #region Health module
    TerminusModule.forRootAsync({
      inject: [TypeOrmHealthIndicator],
      useFactory: (db) => getTerminusOptions(db),
    }),
    // #endregion
  ],

  providers: [
    // #region GraphQL
    DateScalar,
    ByteArrayScalar,
    // #endregion

    // #region Errors
    // TODO: Next.JS is forwarding through RenderService -> setErrorHandler
    // {
    //   provide: APP_FILTER,
    //   inject: [LogService],
    //   useFactory: (logService: LogService) => {
    //     return new HttpErrorFilter(logService);
    //   },
    // },
    // #endregion

    LoggingInterceptorProvider,

    CacheInterceptorProvider,

    // #region GraphQL interceptor
    // {
    // TODO: сделать чтобы IntrospectionQuery блокировался до тех пор пока кто-либо не воспользуется login
    //   provide: APP_INTERCEPTOR,
    //   useClass: GraphQLInterceptor,
    // },
    // #endregion
  ],
})
export class AppModule {}
