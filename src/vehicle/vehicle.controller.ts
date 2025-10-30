import { BadRequestException, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, Query, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from 'multer';
import { VehicleService } from "./vehicle.service";



@Controller('file')
export class VehicleController {
   
    constructor(private readonly vehicleService: VehicleService) { }

    @Post('/import')
    @UseInterceptors(FileInterceptor('file'))
    async importCsv(@UploadedFile()

    file: Express.Multer.File) {
        console.log("-------------------vehicle endpoint called--------------")


        console.log("Import endpoint called:", file.originalname);
        // Add this line to see what you're getting

        if (!file) {
            throw new BadRequestException('File is required');
        }

        if (!file.originalname.toLowerCase().endsWith('.csv')) {
            throw new BadRequestException('Only CSV files are allowed');
        }

        return this.vehicleService.forwardCsvToBackground(file.path, file.originalname);
    }



}