import {
     BadRequestException, 
     Controller, 
     FileTypeValidator, 
     Get, 
     Param, 
     ParseFilePipe, 
     Post, 
     Query, 
     Res, 
     UploadedFile, 
     UseInterceptors,
     Logger ,
     InternalServerErrorException} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from 'multer';
import { VehicleService } from "./vehicle.service";



@Controller('file')
export class VehicleController {
     private readonly logger = new Logger(VehicleController.name);

    constructor(private readonly vehicleService: VehicleService) { }

    @Post('/import')
     @UseInterceptors(FileInterceptor('file'))
  async importCsv(
@UploadedFile(
  new ParseFilePipe({
    validators: [
      new FileTypeValidator({
        fileType: /(text\/csv|application\/vnd\.ms-excel)/,
      }),
    ],
  }),
)
    file: Express.Multer.File,
  ) {
    this.logger.log('Vehicle CSV import endpoint called.');

    try {
      if (!file) {
        this.logger.warn('No file uploaded in request.');
        throw new BadRequestException('File is required.');
      }

      this.logger.log(`Received file: ${file.originalname}`);

      if (file.size === 0) {
        this.logger.warn('Uploaded CSV file is empty.');
        throw new BadRequestException('Uploaded CSV file is empty.');
      }

      if (!file.originalname.toLowerCase().endsWith('.csv')) {
        this.logger.warn('Uploaded file is not a CSV.',file.originalname);
        throw new BadRequestException('Only CSV files are allowed.');
      }

      this.logger.log(
        `Forwarding CSV (${file.originalname}) to background service...`,
      );

      const response = await this.vehicleService.forwardCsvToBackground(
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


}