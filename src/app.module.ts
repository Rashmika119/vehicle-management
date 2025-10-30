import { Module } from '@nestjs/common';
import { VehicleModule } from './vehicle/vehicle.module';
import { ConsumerController } from './background/controller/consumer.controller';
import { ConsumerService } from './background/service/consumer.service';
import { ProducerService } from './background/service/producer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './vehicle/entities/vehicle.entity';

import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    VehicleModule,
    HttpModule,
    TypeOrmModule.forFeature([Vehicle]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379, 
      },
    }),
    BullModule.registerQueue({
      name: 'csvQueue', 
    }),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService, ProducerService],
})
export class AppModule {}
