
import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import bull from 'bull';
import path from 'path';
import * as fs from 'fs';
import { Response as ExpressResponse } from 'express';


//this class add jobs to the queque

@Injectable()
export class ProducerService {
  constructor(@InjectQueue('csvQueue') private jobQueue: bull.Queue) { }

  async addImportJobs(filePath: string, fileName: string) {
    const job = await this.jobQueue.add('importCsv', {
      filePath,
      fileName
    });

    return {
      jobId: job.id,
      message: 'Csv import job added to queue',
    }
  }
  async addExportJob(age_of_the_vehicle: number,clientName:string) {
    console.log("age:",age_of_the_vehicle)
    return this.jobQueue.add('export-vehicles', { age_of_the_vehicle ,clientName});
  }

  // async streamCsv(jobId: string, res: ExpressResponse) {
  //   const filePath = path.join(process.cwd(), 'exports', `${jobId}.csv`);

  //   if (!fs.existsSync(filePath)) {
  //     throw new NotFoundException('File not generated yet or job failed');
  //   }

  //   res.setHeader('Content-Type', 'text/csv');
  //   res.setHeader('Content-Disposition', `attachment; filename="${jobId}.csv"`);
  //   console.log("ready to send to the backend")

  //   const readStream = fs.createReadStream(filePath);
  //   readStream.pipe(res);
  //   console.log("downloaded successfully")

  // }

}
