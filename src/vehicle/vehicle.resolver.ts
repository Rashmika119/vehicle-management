import { Controller, Get, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
  async findAll(@Args('pagination', { nullable: true }) pagination?: PaginationInput): Promise<Vehicle[]> {
    this.logger.log('Fetching all vehicles...');
    const vehicles = await this.vehicleService.findAll(pagination);
    this.logger.log(`Fetched ${vehicles.length} vehicles.`);
    return vehicles;
  }

  @Mutation(() => Vehicle, { name: "createVehicle" })
  async create(@Args('vehicleInput') vehicle: CreateVehicleInput): Promise<Vehicle> {
    this.logger.log('Creating a new vehicle...');
    const created = await this.vehicleService.create(vehicle);
    this.logger.log(`Vehicle created successfully with ID: ${created.id}`);
    return created;
  }

  @Query(() => Vehicle, { name: "findVehicleById" })
  async findOne(@Args("id") id: string): Promise<Vehicle> {
    this.logger.log(`Fetching vehicle by ID: ${id}`);
    const vehicle = await this.vehicleService.findOne(id);
    if (!vehicle) {
      this.logger.warn(`Vehicle not found with ID: ${id}`);
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  @Query(() => Vehicle, { name: "findVehicleByVin" })
  async getVehicle(@Args('vin') vin: string): Promise<Vehicle> {
    this.logger.log(`Fetching vehicle by VIN: ${vin}`);
    const vehicle = await this.vehicleService.findByVin(vin);
    if (!vehicle) {
      this.logger.warn(`Vehicle not found with VIN: ${vin}`);
      throw new NotFoundException(`Vehicle with VIN ${vin} not found`);
    }
    return vehicle;
  }

  @Mutation(() => Vehicle, { name: "updateVehicle" })
  async update(@Args('id') id: string, @Args('vehicle') vehicle: UpdateVehicleInput): Promise<Vehicle> {
    this.logger.log(`Updating vehicle with ID: ${id}`);
    console.log('Update input:', vehicle);
    return await this.vehicleService.update(id, vehicle);
  }

  @Mutation(() => Boolean, { name: 'removeVehicle' })
  async remove(@Args('id') id: string): Promise<boolean> {
    this.logger.log(`Removing vehicle with ID: ${id}`);
    return await this.vehicleService.remove(id);
  }

  @Query(() => [Vehicle], { name: "searchVehicle" })
  async search(
    @Args('search', { type: () => SearchVehicleInput, nullable: true }) search?: SearchVehicleInput,
    @Args('pagination', {type:()=>PaginationInput, nullable: true }) pagination?: PaginationInput)
    : Promise<Vehicle[]> {
    this.logger.log('Searching vehicles...');
    return await this.vehicleService.search(search,pagination);
  }

  @ResolveReference()
  async resolvereferance(ref: { __typename: string, vin: string }) {
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
