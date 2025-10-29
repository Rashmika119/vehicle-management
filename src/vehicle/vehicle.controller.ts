import { BadRequestException, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, Query, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Multer } from 'multer';
import { VehicleService } from "./vehicle.service";
import path from "path";
import * as fs from 'fs';
import type { Response } from 'express';


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


@Get('/file/download/:id')
downloadFile(@Param('id') id: string, @Res() res: Response) {
  const filePath = path.join(process.cwd(), 'exports', `${id}.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath); 
}
}