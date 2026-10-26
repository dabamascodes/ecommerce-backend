import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvConfiguration, JoiValidationSchema  } from './common/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.getOrThrow('database');

        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: db.synchronize,
          logging: db.logging,
          ssl: db.ssl,
        };
      },
    }),

    AuthModule,

    UsersModule,

    AddressesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}