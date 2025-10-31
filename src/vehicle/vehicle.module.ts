import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig, ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';


import { VehicleResolver } from './vehicle.resolver';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      plugins: [ApolloServerPluginInlineTrace()],
      playground: true,
      debug: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin1234',
      database: 'vehicle',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    HttpModule,
    MulterModule.register({
      dest: './uploads', 
    }),
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleResolver],
})
export class VehicleModule {}
