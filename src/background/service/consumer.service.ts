
import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import type { Job } from "bull";
import csvParser from "csv-parser";
import { Logger } from '@nestjs/common';

import * as fs from 'fs';
import path from "path";
import { Vehicle } from "src/vehicle/entities/vehicle.entity";
import { MoreThanOrEqual, Repository } from "typeorm";

import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Processor('csvQueue')
export class ConsumerService {
    

     private readonly logger = new Logger(ConsumerService.name);

    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepo: Repository<Vehicle>,
        private readonly httpService:HttpService
    ) { }

    @Process('importCsv')
    async importCsv(job: Job<{ fileName: string; filePath: string }>) {
        console.log(`Processing CSV: ${job.data.fileName}`);

        let processedRows = 0;
        let failedRows = 0;

        return new Promise((resolve, reject) => {
            
            const stream = fs.createReadStream(job.data.filePath)
                .pipe(csvParser());

            stream.on('data', async (row) => {
                stream.pause();

                try {
                    await this.saveRow(row);
                    processedRows++;
                    console.log("Processed row:", processedRows);
                } catch (error) {
                    failedRows++;
                    console.error("Row failed to save:", error.message);
                }

                stream.resume(); 
            });

            stream.on('end', () => {
                console.log("CSV processing completed!");
                console.log(`Total rows processed: ${processedRows}`);
                console.log(`Failed rows: ${failedRows}`);

                fs.unlink(job.data.filePath, (err) => {
                    if (err) console.error("Failed to delete file:", err);
                });

                resolve({
                    status: 'completed',
                    totalRows: processedRows,
                    failedRows: failedRows
                });
            });

            stream.on('error', (error) => {
                console.error('CSV reading error:', error);
                reject(error);
            });
        });
    }

    async saveRow(row: any) {

        if(!row.vin){
            this.logger.warn(`Skipping row without VIN: ${JSON.stringify(row)}`)
            return;
        }

        const existing=await this.vehicleRepo.findOne({where:{vin:row.vin}});
        if(existing){
            this.logger.log(`Duplicate VIN found,skipping:${row.vin}`)
            return
        }

        const age_of_the_vehicle = await this.getAge(row.manufactured_date);
        const vehicle = this.vehicleRepo.create({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            car_make: row.car_make,
            car_model: row.car_model,
            vin: row.vin,
            manufactured_date: new Date(row.manufactured_date),
            age_of_the_vehicle: age_of_the_vehicle
        });

        await this.vehicleRepo.save(vehicle);
        this.logger.log(`Inserted new vehicle with VIN :${row.vin}`)
    }
    async getAge(manufactured_date: string): Promise<number> {
        const today = new Date();
        const manufactured = new Date(manufactured_date);

        let age_of_the_vehicle = today.getFullYear() - manufactured.getFullYear()
        const month_gap = today.getMonth() - manufactured.getMonth()
        const date_gap = today.getDate() - manufactured.getDate()

        if (month_gap < 0 || month_gap == 0 && date_gap < 0) {
            age_of_the_vehicle--;
        }
        return age_of_the_vehicle;
    }

    @Process('export-vehicles')
    async handleExport(job: Job) {
        const { age_of_the_vehicle, clientName } = job.data;

        const vehicles = await this.vehicleRepo.find({
            where: { age_of_the_vehicle: MoreThanOrEqual(age_of_the_vehicle) },
            order: { manufactured_date: 'ASC' },
        });

        if (!vehicles.length) {
            throw new Error('No vehicles found for the given age');
        }

        let csvContent = 'id,first_name,last_name,email,car_make,car_model,vin,manufactured_date,age_of_the_vehicle\n';
        vehicles.forEach(v => {
            csvContent += `${v.id},${v.first_name},${v.last_name},${v.email},${v.car_make},${v.car_model},${v.vin},${v.manufactured_date.toISOString()},${v.age_of_the_vehicle}\n`;
        });
        console.log("file created")
        const exportDir = path.join(process.cwd(),'exports');
        console.log("file stored temporarly in location:  ", exportDir)
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

        const filePath = path.join(exportDir, `${job.id}.csv`);
        fs.writeFileSync(filePath, csvContent);
        console.log('File created at', filePath); 


        const payload = {
        jobId: job.id,
        fileUrl: `http://localhost:3000/file/download/${job.id}`,
        message: `Export completed for vehicle age >= ${age_of_the_vehicle}`,
        clientName
    };
    console.log("payload   :", payload);

  
    const targetUrl = 'http://localhost:3002/socket/notify';
    
    console.log("Sending notification to:", targetUrl);
    
    try {
        const response = await firstValueFrom(
            this.httpService.post(targetUrl, payload)
        );
        console.log('Notification sent successfully:', response.data);
    } catch (err) {
        console.error('Error sending notification:', err.message);
        console.error('Full error:', err.response?.data);
    }
    
    console.log("publish the notification");

    return { success: true, filePath };

    }
}