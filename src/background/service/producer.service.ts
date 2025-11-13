
import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException ,Logger} from '@nestjs/common';
import bull from 'bull';


@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);
  constructor(@InjectQueue('csvQueue') private jobQueue: bull.Queue) { }

  async addImportJobs(filePath: string, fileName: string) {
    try{
    const job = await this.jobQueue.add('importCsv', {
      filePath,
      fileName
    });
    this.logger.log(`CSV import job added: ${fileName} (Job ID: ${job.id})`);
    return {
      jobId: job.id,
      message: 'Csv import job added to queue',
    } 
  }catch(error){
    this.logger.error(`Failed to add import job for file ${fileName}`)
    return{
      success:false,
      message:'Failed to add import job'
    }
  }
  }
  async addExportJob(age_of_the_vehicle: number,clientName:string) {
    try{
    const job=await this.jobQueue.add('export-vehicles', { age_of_the_vehicle ,clientName});
    this.logger.log('CSV export job added for age >= ${age_of_the_vehicle} (Job ID: ${job.id})')
    return{
      jobId:job.id,
      message:'CSV export job added to queue'
    };
  }catch(error){
    this.logger.error(`Failed to add export job for age ${age_of_the_vehicle}`, error.stack)
    return{
      success:false,
      message:'Failed to add export job'
    }
  }
  }
}
