
// import { Injectable } from '@nestjs/common';
// import Redis from 'ioredis';

// @Injectable()
// export class RedisPublisher {
//   private client: Redis;

//   constructor() {
//     this.client = new Redis({ host: 'localhost', port: 6379 });
//   }

//   async publish(channel: string, message: any) {
//     await this.client.publish(channel, JSON.stringify(message));
//   }
// }
