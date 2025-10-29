import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';


import { VehicleResolver } from './vehicle.resolver';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/vehicle-SchemaDropCommand.gpl'),
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
      dest: './uploads', // folder to store uploaded files
    }),
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleResolver],
})
export class VehicleModule {}
