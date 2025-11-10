import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { Response as ExpressResponse } from 'express';
import { ProducerService } from '../service/producer.service';
import path from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import {NotFoundException,InternalServerErrorException,Logger} from "@nestjs/common";
@Controller('job')
export class ConsumerController {
  private readonly logger=new Logger(ConsumerController.name)

  constructor(private readonly producerService: ProducerService) { }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile(

  ) file: Express.Multer.File) {
    console.log("import endpoint called: ", file.originalname)
    if (!file) {
      this.logger.warn('No file received');
      throw new BadRequestException('File is required');
    }

    this.logger.log(`File received: ${file.originalname}`);
    this.logger.debug(`File path: ${file.path}`);
    return this.producerService.addImportJobs(file.path, file.originalname)
  }


  @Post('export')
  exportVehicles(@Body() body: { age_of_the_vehicle: number; clientName: string }) {
    const { age_of_the_vehicle, clientName } = body;
    console.log("Export request received:", age_of_the_vehicle, clientName);

    return this.producerService.addExportJob(age_of_the_vehicle, clientName);
  }

@Get('/download/:id')
downloadFile(@Param('id') id: string, @Res() res: Response) {
  const filePath = path.join(process.cwd(),'exports',`${id}.csv`);
  console.log('download file path ---.',filePath)

  if (!fs.existsSync(filePath)) {
    this.logger.error("the file you are asking to download is not found")
    return res.status(404).send("File not found");
  }

  res.download(filePath,(err)=>{
    if(err){
      this.logger.error("Error of downloading the file");
    }
  }); 
}
  // @Get('download/:jobId')
  // async downloadFile(
  //   @Param('jobId') jobId: string,
  //   @Res() res: ExpressResponse,
  // ) {
  //   console.log("called the download endpoint")
  //   console.log("job id", jobId);

  //   await this.producerService.streamCsv(jobId, res);
  // }
}


