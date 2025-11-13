import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { Response as ExpressResponse } from 'express';
import { ProducerService } from '../service/producer.service';
import path, { join } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import { NotFoundException, InternalServerErrorException, Logger } from "@nestjs/common";
@Controller('job')
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name)

  constructor(private readonly producerService: ProducerService) {}

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    this.logger.log('Vehicle CSV import endpoint called.');

    try {
      if (!file) {
        this.logger.warn('No file uploaded in request.');
        throw new BadRequestException('File is required.');
      }
      if (file.size === 0) {
        this.logger.warn('Uploaded CSV file is empty.');
        throw new BadRequestException('Uploaded CSV file is empty.');
      }

      if (!file.path) {
        throw new BadRequestException('File path missing — upload might have failed');
      }

      if (!file.originalname.toLowerCase().endsWith('.csv')) {
        this.logger.warn('Uploaded file is not a CSV.', file.originalname);
        throw new BadRequestException('Only CSV files are allowed.');
      }

      this.logger.log(
        `Forwarding CSV (${file.originalname}) to producer service...`,
      );
      this.logger.log(
        `Forwarding CSV (${file.path}) to producer service...`,
      );

      const response = await this.producerService.addImportJobs(
        file.path,
        file.originalname,
      );

      this.logger.log(
        `CSV file (${file.originalname}) processed successfully.`,
      );

      return {
        message: 'CSV file uploaded and forwarded successfully.',
        data: response,
      };
    } catch (error) {
      this.logger.error(
        `Error occurred while processing CSV file: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Failed to process the uploaded CSV file.',
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

}


