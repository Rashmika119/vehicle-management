import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { Response as ExpressResponse } from 'express';
import { ProducerService } from '../service/producer.service';
import path, { join } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import {NotFoundException,InternalServerErrorException,Logger} from "@nestjs/common";
import { existsSync } from 'fs';
@Controller('job')
export class ConsumerController {
  private readonly logger=new Logger(ConsumerController.name)

  constructor(private readonly producerService: ProducerService) { 
        const uploadDir = join(__dirname, '..', '..', 'uploads');
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file',{ dest: './uploads' }))
  async importCsv(@UploadedFile(

  ) file: Express.Multer.File) {
    console.log("import endpoint called: ", file.originalname)
    if (!file) {
      this.logger.warn('No file received');
      throw new BadRequestException('File is required');
    }
    try{
    this.logger.log(`File received: ${file.originalname}`);
    this.logger.debug(`File path: ${file.path}`);
    return this.producerService.addImportJobs(file.path, file.originalname);
    }catch(error){
      this.logger.error(`Error while processing import file ${file.originalname}: ${error.message}`,);
      throw new InternalServerErrorException(
        'An error occured while importing the file. ',
      );
    }
  }


  @Post('export')
async exportVehicles(
    @Body() body: { age_of_the_vehicle: number; clientName: string },
  ) {
    try {
      const { age_of_the_vehicle, clientName } = body;

      if (!age_of_the_vehicle || !clientName) {
        this.logger.warn('Missing required export parameters');
        throw new BadRequestException(
          'Both age_of_the_vehicle and clientName are required.',
        );
      }

      this.logger.log(
        `Export request received for client "${clientName}" with vehicle age: ${age_of_the_vehicle}`,
      );

      return await this.producerService.addExportJob(
        age_of_the_vehicle,
        clientName,
      );
    } catch (error) {
      this.logger.error(`Error exporting data: ${error.message}`);
      throw new InternalServerErrorException(
        'An error occurred while exporting the data.',
      );
    }
  }


  @Get('/download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'exports', `${id}.csv`);
    this.logger.log(`Download requested for file ID: ${id}`);
    this.logger.debug(`Resolved file path: ${filePath}`);

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`File not found: ${filePath}`);
        throw new NotFoundException('File not found.');
      }

      res.download(filePath, (err) => {
        if (err) {
          this.logger.error(
            `Error occurred while downloading file ${filePath}: ${err.message}`,
          );
          throw new InternalServerErrorException(
            'Error occurred while downloading the file.',
          );
        } else {
          this.logger.log(`File ${filePath} downloaded successfully.`);
        }
      });
    } catch (error) {
      this.logger.error(
        `Unexpected error while handling download for ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while processing the download.',
      );
    }
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


