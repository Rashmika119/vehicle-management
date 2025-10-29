import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { Response as ExpressResponse } from 'express';
import { ProducerService } from '../service/producer.service';

@Controller('job')
export class ConsumerController {
  constructor(private readonly producerService: ProducerService) { }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile(

  ) file: Express.Multer.File) {
    console.log("import endpoint called: ", file.originalname)
    if (!file) {
      throw new BadRequestException('File is required');
    }

    console.log("File received:", file.originalname);
    console.log("File path:", file.path);
    return this.producerService.addImportJobs(file.path, file.originalname)
  }


  @Post('export')
  exportVehicles(@Body() body: { age_of_the_vehicle: number; clientName: string }) {
    const { age_of_the_vehicle, clientName } = body;
    console.log("Export request received:", age_of_the_vehicle, clientName);

    return this.producerService.addExportJob(age_of_the_vehicle, clientName);
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


