import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vehicle } from "./entities/vehicle.entity";
import { HttpService } from "@nestjs/axios";
import { Repository } from "typeorm";
import { PaginationInput } from "./dto/pagintion.input";
import { CreateVehicleInput } from "./dto/create-vehicle.input";
import { UpdateVehicleInput } from "./dto/update-vehicle.input";
import { SearchVehicleInput } from "./dto/search-vehicle.input";
import { firstValueFrom, lastValueFrom } from "rxjs";
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class VehicleService {
  constructor(@InjectRepository(Vehicle) private vehicleRepository: Repository<Vehicle>,
    private readonly httpService: HttpService) { }

  private backgroundServiceUrl = 'http://localhost:3000/job';

  async findAll(pagination?: PaginationInput): Promise<Vehicle[]> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 100;
    const skip = (page - 1) * limit

    return this.vehicleRepository.find({
      order: { manufactured_date: 'ASC' },
      take: limit,
      skip: skip,
    });
  }

  async findOne(id: string) {
    return this.vehicleRepository.findOne({ where: { id } });
  }

  async create(vehicleObject: CreateVehicleInput): Promise<Vehicle> {
    try {
      let vehicle = this.vehicleRepository.create(vehicleObject
      )
        ;
      const savedVehicle = await this.vehicleRepository.save(vehicle)
      console.log("Saved vehicle:", savedVehicle);
      return savedVehicle
    } catch (error) {
      console.error("Error saving vehicle:", error);
      throw new Error("Failed to create vehicle");
    }
  }

  async update(id: string, updateVehicleInput: UpdateVehicleInput): Promise<Vehicle> {
    console.log('Updating vehicle:', id, updateVehicleInput);

    const existingVehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!existingVehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    const vehicleToUpdate = this.vehicleRepository.merge(existingVehicle, updateVehicleInput);

    if (updateVehicleInput.manufactured_date) {
      vehicleToUpdate.age_of_the_vehicle = this.calculateAge(updateVehicleInput.manufactured_date);
      console.log('Recalculated age:', vehicleToUpdate.age_of_the_vehicle);
    }

    const savedVehicle = await this.vehicleRepository.save(vehicleToUpdate);
    console.log('Vehicle updated successfully');

    return savedVehicle;
  }
  private calculateAge(manufacturedDate: Date): number {
    const today = new Date();
    const manufactured = new Date(manufacturedDate);

    let age = today.getFullYear() - manufactured.getFullYear();
    const monthDiff = today.getMonth() - manufactured.getMonth();
    const dayDiff = today.getDate() - manufactured.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

async remove(id: string): Promise<boolean> {
    console.log('Deleting vehicle with id:', id);
    
    const vehicle = await this.findOne(id);
    
    if (!vehicle) {
        throw new NotFoundException(`Vehicle with id ${id} not found`);
    }
    
    const result = await this.vehicleRepository.delete(id);
    
    if (result.affected === 1) {
        console.log('Vehicle deleted successfully');
        return true;
    }
    
    throw new Error(`Failed to delete vehicle with id ${id}`);
}
  async search(search: SearchVehicleInput): Promise<Vehicle[]> {
    const query = this.vehicleRepository.createQueryBuilder('vehicle');
    console.log("searched car model:  ", search.car_model)
    if (search?.car_model) {
      query.andWhere('vehicle.car_model ILIKE :car_model', { car_model: `${search.car_model}%` });
    }
    return query.getMany()
  }

  async forwardCsvToBackground(filepath: string, fileName: string) {
    try {
      console.log("enter to the forward csv function")
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filepath), fileName);
      const url = "http://localhost:3000/job/import";
      console.log("endpoint of background service called")

      const response = await lastValueFrom(
        this.httpService.post(url, formData, {
          headers: formData.getHeaders(),

        })
      );
      console.log("get the format data")
      fs.unlink(filepath, (err) => {
        if (err) console.error("Failed to delete local file: ", err)
        console.log("the tempory file deleted from the vehicle serivce")
      })
      console.log("response data returned")
      fs.unlink(filepath, (err) => {
        if (err) {
          console.error("Failed to delete local file: ", err);
        } else {
          console.log("Temporary file deleted successfully from uploads");
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error forwarding Csv to background service: ", error)
      throw new Error("Failed to forward csv file")
    }
  }


  // async downloadCsv(jobId: string) {
  //   const res = await firstValueFrom(

  //     this.httpService.get(`${this.backgroundServiceUrl}/download/${jobId}`, {
  //       responseType: 'stream',
  //     })
  //   );
  //   console.log("job id: ", jobId)
  //   console.log("the background service endpoint called to download");
  //   return res.data;
  // }
}
