/** @format */
// eslint-disable-next-line spaced-comment
/// <reference types="../../../typings/global" />

//#region Imports NPM
import { resolve } from 'path';
// import { APP_FILTER } from '@nestjs/core';
// import Next from 'next';
import { Module, CacheModule } from '@nestjs/common';
import { GraphQLModule, GqlModuleOptions } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import WebSocket from 'ws';
import { RenderModule } from 'nest-next';
import redisCacheStore from 'cache-manager-redis-store';
import { LoggerModule, Logger } from 'nestjs-pino';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
//#endregion
//#region Imports Local
import { Folder, Contact } from '@lib/types';

import { ConfigModule, ConfigService } from '@app/config';
import { LoggingInterceptorProvider } from '@app/logging.interceptor';
import { CacheInterceptorProvider } from '@app/cache.interceptor';
// import { HttpErrorFilter } from './filters/http-error.filter';

import { DateScalar } from '@back/shared/date.scalar';
import { ByteArrayScalar } from '@back/shared/bytearray.scalar';
import { ControllersModule } from '@back/controllers/controllers.module';
import { AuthModule } from '@back/auth/auth.module';
import { UserModule } from '@back/user/user.module';
import { NewsModule } from '@back/news/news.module';
import { ProfileModule } from '@back/profile/profile.module';
import { GroupModule } from '@back/group/group.module';
import { Upload } from '@back/shared/upload.scalar';

import { GroupEntity } from '@back/group/group.entity';
import { ProfileEntity } from '@back/profile/profile.entity';
import { UserEntity } from '@back/user/user.entity';
import { TicketsModule } from '@back/tickets/tickets.module';
import { NewsEntity } from '@back/news/news.entity';
import { FilesModule } from '@back/files/files.module';

import { TypeOrmLogger } from '@back/shared/typeormlogger';
import { pinoOptions } from '@back/shared/pino.options';
import { PingPongResolvers } from './ping.resolver';
import { ConnectionContext } from 'subscriptions-transport-ws';
//#endregion

const environment = resolve(__dirname, __DEV__ ? '../../..' : '../..', '.local/.env');

//#region TypeOrm config options
export const typeOrmPostgres = (configService: ConfigService, logger: Logger): TypeOrmModuleOptions => ({
  name: 'default',
  keepConnectionAlive: true,
  type: 'postgres',
  replication: {
    master: { url: configService.get<string>('DATABASE_URI') },
    slaves: [{ url: configService.get<string>('DATABASE_URI_RD') }],
  },
  schema: configService.get<string>('DATABASE_SCHEMA'),
  uuidExtension: 'pgcrypto',
  logger: new TypeOrmLogger(logger),
  synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
  dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
  logging: configService.get<boolean>('DEVELOPMENT')
    ? true
    : configService.get('DATABASE_LOGGING') === 'false'
    ? false
    : configService.get('DATABASE_LOGGING') === 'true'
    ? true
    : JSON.parse(configService.get('DATABASE_LOGGING')),
  entities: [GroupEntity, ProfileEntity, UserEntity, NewsEntity],
  migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
  cache: {
    type: 'redis', // "ioredis/cluster"
    options: {
      url: configService.get<string>('DATABASE_REDIS_URI'),
      scaleReads: 'slave',
      max: 10000,
    },
    alwaysEnabled: true,
    /**
     * Time in milliseconds in which cache will expire.
     * This can be setup per-query.
     * Default value is 1000 which is equivalent to 1 second.
     */
    duration: configService.get<number>('DATABASE_REDIS_TTL'),
  },
});
//#endregion

@Module({
  imports: [
    //#region Config module
    ConfigModule.register(environment),
    //#endregion

    //#region Logging module
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) =>
        pinoOptions(config.get<string>('LOGLEVEL'), config.get<boolean>('DEVELOPMENT')),
    }),
    //#endregion

    //#region Next RenderModule
    // TODO: появляется NOT FOUND перед загрузкой страницы
    RenderModule, // .forRootAsync(Next({ dev: __DEV__, dir: __DEV__ ? 'apps/portal' : '', quiet: false })),
    //#endregion

    //#region Cache Manager - Redis
    CacheModule.registerAsync({
      imports: [LoggerModule],
      inject: [ConfigService, Logger],
      useFactory: async (configService: ConfigService, logger: Logger) => {
        logger.debug('Redis connection: success', 'CacheModule');

        return {
          store: redisCacheStore,
          ttl: configService.get<number>('HTTP_REDIS_TTL'), // seconds
          max: configService.get<number>('HTTP_REDIS_MAX_OBJECTS'), // maximum number of items in cache
          url: configService.get<string>('HTTP_REDIS_URI'),
          // retry_strategy: (options) => {}
        };
      },
    }),
    //#endregion

    //#region GraphQL
    Upload,
    GraphQLModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // TODO: cache, persistedQueries
        debug: configService.get<boolean>('DEVELOPMENT'),
        tracing: configService.get<boolean>('DEVELOPMENT'),
        introspection: configService.get<boolean>('DEVELOPMENT'),
        connectToDevTools: configService.get<boolean>('DEVELOPMENT'),
        playground: configService.get<boolean>('DEVELOPMENT')
          ? {
              settings: {
                // Когда в playground режиме, нажмите settings и добавьте строку:
                'request.credentials': 'same-origin',
              },
            }
          : false,
        typePaths: ['./**/*.graphql'],
        cors: {
          // origin: 'https://localhost:4000',
          credentials: true,
        },
        installSubscriptionHandlers: true,
        // subscriptions: {
        //   keepAlive: 5000,
        //   onConnect: async (
        //     _connectionParameters: Record<string, any>,
        //     _websocket: WebSocket,
        //     _context: ConnectionContext,
        //   ): Promise<any> => {},
        //   onDisconnect: async (_websocket: WebSocket, _context: ConnectionContext): Promise<any> => {},
        // },
        uploads: {
          maxFileSize: 100000000, // 100MB
        },
        context: async ({ req, res, payload, connection }) => ({ req, res, payload, connection }),
      }),
    }),
    //#endregion

    //#region TypeORM
    TypeOrmModule.forRootAsync({
      imports: [LoggerModule],
      inject: [ConfigService, Logger],
      useFactory: async (configService: ConfigService, logger: Logger) => {
        logger.debug('Database connection: success', 'Database');

        return typeOrmPostgres(configService, logger);
      },
    }),
    //#endregion

    //#region Profile
    ProfileModule,
    //#endregion

    //#region Authentication
    AuthModule,
    //#endregion

    //#region Groups
    GroupModule,
    //#endregion

    //#region Users
    UserModule,
    //#endregion

    //#region News
    NewsModule,
    //#endregion

    //#region Files module
    FilesModule,
    //#endregion

    //#region Tickets module
    TicketsModule,
    //#endregion

    //#region Controllers module
    ControllersModule,
    //#endregion
  ],

  providers: [
    //#region GraphQL
    DateScalar,
    ByteArrayScalar,
    //#endregion

    //#region Errors
    // TODO: Next.JS is forwarding through RenderService -> setErrorHandler
    // {
    //   provide: APP_FILTER,
    //   inject: [LogService],
    //   useFactory: (logService: LogService) => {
    //     return new HttpErrorFilter(logService);
    //   },
    // },
    //#endregion

    LoggingInterceptorProvider,

    CacheInterceptorProvider,

    //#region GraphQL interceptor
    // {
    // TODO: сделать чтобы IntrospectionQuery блокировался до тех пор пока кто-либо не воспользуется login
    //   provide: APP_INTERCEPTOR,
    //   useClass: GraphQLInterceptor,
    // },
    //#endregion

    PingPongResolvers,
    {
      provide: 'PUB_SUB',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('HTTP_REDIS_URI')?.replace(/^redis:\/\/(.*?):(\d+)\/(\d+)$/, '$1');
        const redisOptions = {
          host,
        };

        return new RedisPubSub({
          publisher: new Redis(redisOptions),
          subscriber: new Redis(redisOptions),
        });
      },
    },
  ],
})
export class AppModule {}
