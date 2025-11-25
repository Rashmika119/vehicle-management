import { Injectable, NotFoundException,Logger} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vehicle } from "./entities/vehicle.entity";
import { HttpService } from "@nestjs/axios";
import { Repository } from "typeorm";
import { PaginationInput } from "./dto/pagintion.input";
import { CreateVehicleInput } from "./dto/create-vehicle.input";
import { UpdateVehicleInput } from "./dto/update-vehicle.input";
import { SearchVehicleInput } from "./dto/search-vehicle.input";

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(@InjectRepository(Vehicle) private vehicleRepository: Repository<Vehicle>,
  private readonly httpService: HttpService) { }

  // private backgroundServiceUrl = 'http://localhost:3000/job';

  async findAll(pagination?: PaginationInput): Promise<Vehicle[]> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 100;
    const skip = (page - 1) * limit

    const vehicles= await this.vehicleRepository.find({
      order: { manufactured_date: 'ASC' },
      take: limit,
      skip: skip,
    });
    if(!vehicles.length){
      return []   
    }
    return vehicles
  }

  

  async findOne(id: string) : Promise<Vehicle> {
    this.logger.log(`Fetching vehicle with id: ${id}`);
    
      const vehicle = await this.vehicleRepository.findOne({ where: { id } });
      if (!vehicle) {
        this.logger.warn(`Vehicle with id ${id} not found`);
        throw new NotFoundException(`Vehicle with id ${id} not found`);
      }
      return vehicle;
    
  }



  async findByVin(vin:string):Promise<Vehicle>{
    const vehicle = await this.vehicleRepository.findOne({where:{vin}})
    if(!vehicle){
      throw new NotFoundException(`vehicle with vin :${vin} not found`)
    }
    return vehicle 
  }

  async create(vehicleObject: CreateVehicleInput): Promise<Vehicle> {
    this.logger.log('Creating new vehicle...');
      const vehicle = this.vehicleRepository.create(vehicleObject);
      const savedVehicle = await this.vehicleRepository.save(vehicle);
      this.logger.log(`Vehicle created successfully with vin: ${vehicleObject.vin}`);
      return savedVehicle;
  }



  async update(id: string, updateVehicleInput: UpdateVehicleInput): Promise<Vehicle> {
    this.logger.log(`Updating vehicle with id: ${id}`);
    
      const existingVehicle = await this.vehicleRepository.findOne({ where: { id } });

      if (!existingVehicle) {
        this.logger.warn(`Vehicle with id ${id} not found`);
        throw new NotFoundException(`Vehicle with id ${id} not found`);
      }

      const vehicleToUpdate = this.vehicleRepository.merge(existingVehicle, updateVehicleInput);

      if (updateVehicleInput.manufactured_date) {
        vehicleToUpdate.age_of_the_vehicle = this.calculateAge(updateVehicleInput.manufactured_date);
        this.logger.debug(`Recalculated age: ${vehicleToUpdate.age_of_the_vehicle}`);
      }

      const savedVehicle = await this.vehicleRepository.save(vehicleToUpdate);

      this.logger.log(`Vehicle with id ${id} updated successfully`);
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
  this.logger.log(`Deleting vehicle with id: ${id}`);

  const vehicle = await this.findOne(id);
  if (!vehicle) {
    this.logger.warn(`Vehicle with id ${id} not found`);
    throw new NotFoundException(`Vehicle with id ${id} not found`);
  }

  const result = await this.vehicleRepository.delete(id);

  if (result.affected && result.affected === 1) {
    this.logger.log(`Vehicle with id ${id} deleted successfully`);
    return true;
  } else {
    this.logger.warn(`Failed to delete vehicle with id ${id}`);
    return false;
  }
}

async search(search?: SearchVehicleInput, pagination?: PaginationInput): Promise<Vehicle[]> {
  const model = search?.car_model?.trim() || ""; 

  const page = pagination?.page || 1;
  const limit = pagination?.limit || 100;
  const skip = (page - 1) * limit;

  const query = this.vehicleRepository
    .createQueryBuilder('vehicle')
    .orderBy('vehicle.manufactured_date', 'ASC')
    .take(limit)
    .skip(skip);

  if (model !== "") {
    query.andWhere('vehicle.car_model ILIKE :car_model', { car_model: `${model}%` });
  }

  const results = await query.getMany();

  if (results.length === 0) {
    this.logger.warn(`No vehicles found for model: ${model || 'any'}`);
    // throw new NotFoundException(`No vehicles found for model: ${model || 'provided filters'}`);
    return [];
  }

  this.logger.log(`Found ${results.length} vehicles for model: ${model || 'all'}`);
  return results;
}


}
