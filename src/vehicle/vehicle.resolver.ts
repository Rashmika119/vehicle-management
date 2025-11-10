import { Controller, Get, Logger, InternalServerErrorException,NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { Args, Mutation, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { SearchVehicleInput } from './dto/search-vehicle.input';
import { PaginationInput } from './dto/pagintion.input';


@Resolver((of) => Vehicle)
export class VehicleResolver {
  private readonly logger = new Logger(VehicleResolver.name);
  constructor(private readonly vehicleService: VehicleService) { }

@Query(() => [Vehicle], { name: "getAllVehicles" })
async findAll(
  @Args('pagination', { nullable: true })
  pagination?: PaginationInput
): Promise<Vehicle[]> {
  this.logger.log('Fetching all vehicles...');
  
  try {
    const vehicles = await this.vehicleService.findAll(pagination);
    this.logger.log(`Fetched ${vehicles.length} vehicles successfully.`);
    return vehicles;
  } catch (error) {
    this.logger.error('Failed to fetch vehicles', error.stack);
    return []; // gracefully return an empty array instead of throwing
  }
}
  @Mutation(() => Vehicle, { name: "createVehicle" ,nullable:true})
  async create(@Args('vehicleInput') vehicle: CreateVehicleInput,):Promise<Vehicle|null> {
      this.logger.log('Creating a new vehicle...');
    try {
      const created = await this.vehicleService.create(vehicle);
      this.logger.log(`Vehicle created successfully with ID: ${created.id}`);
      return created;
    } catch (error) {
      this.logger.error('Failed to create vehicle', error.stack);
      return null;
    }
  }


@Query(() => Vehicle, { name: "findVehicleById", nullable: true })
async findOne(@Args("id") id: string): Promise<Vehicle | null> {
  this.logger.log(`Fetching vehicle by ID: ${id}`);

  try {
    const vehicle = await this.vehicleService.findOne(id);
    if (!vehicle) {
      this.logger.warn(`No vehicle found with ID: ${id}`);
      return null;
    }
    this.logger.log(`Vehicle found: ${vehicle.vin}`);
    return vehicle;
    
  } catch (error) {
    this.logger.error(`Failed to fetch vehicle with ID: ${id}`, error.stack);
    return null; 
  }
}


@Query(() => Vehicle, { name: "findVehicleByVin", nullable: true })
async getVehicle(@Args('vin') vin: string): Promise<Vehicle | null> {
  this.logger.log(`Fetching vehicle by VIN: ${vin}`);

  try {
    const vehicle = await this.vehicleService.findByVin(vin);

    if (!vehicle) {
      this.logger.warn(`No vehicle found with VIN: ${vin}`);
      return null; 
    }
    this.logger.log(`Vehicle found with VIN: ${vin}`);
    return vehicle;
  } catch (error) {
    this.logger.error(`Failed to fetch vehicle with VIN: ${vin}`, error.stack);
    return null; 
  }
}



@Mutation(() => Vehicle, { name: "updateVehiclle", nullable: true })
async update(
  @Args('id') id: string,
  @Args('vehicle') vehicle: UpdateVehicleInput,
): Promise<Vehicle | null> {
  this.logger.log(`Updating vehicle with ID: ${id}`);
  try {
    const updated = await this.vehicleService.update(id, vehicle);
    this.logger.log(`Vehicle updated successfully: ${id}`);
    return updated;
  } catch (error) {
    this.logger.error(`Failed to update vehicle with ID: ${id}`, error.stack);
    return null;
  }
}


  @Mutation(() => Boolean, { name: 'removeVehicle' }) 
  async remove(@Args('id') id: string):Promise<boolean> {
    this.logger.log(`Removing vehicle with ID: ${id}`);
    try {
      const result = await this.vehicleService.remove(id);
      this.logger.log(`Vehicle removed successfully: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to remove vehicle with ID: ${id}`, error.stack);
      return false;
    }
  }
  
  @Query(() => [Vehicle], { name: "searchVehicle" })
  async search(@Args('search', { type: () => SearchVehicleInput, nullable: true })search: SearchVehicleInput,
  ): Promise<Vehicle[]> {
    this.logger.log('Searching vehicles...');
    try {
      const result = await this.vehicleService.search(search);
      this.logger.log(`Found ${result.length} matching vehicles.`);
      return result;
    } catch (error) {
      this.logger.error('Failed to search vehicles', error.stack);
      throw new Error('Failed to search vehicles');
    }
  }

  @ResolveReference()
    async resolvereferance(ref:{__typename:string,vin:string}){
    this.logger.log(`Resolving reference for vehicle VIN: ${ref.vin}`);
    try {
      const vehicle = await this.vehicleService.findByVin(ref.vin);
      if (vehicle) {
        this.logger.log(`Reference resolved for VIN: ${ref.vin}`);
      } else {
        this.logger.warn(`No vehicle found for VIN reference: ${ref.vin}`);
      }
      return vehicle;
    } catch (error) {
      this.logger.error('Failed to resolve vehicle reference', error.stack);
      
    }
    }
  
}
