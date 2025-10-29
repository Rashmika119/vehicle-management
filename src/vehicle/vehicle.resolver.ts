import { Controller, Get } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';
import { SearchVehicleInput } from './dto/search-vehicle.input';
import { PaginationInput } from './dto/pagintion.input';



@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) { }

  @Query(() => [Vehicle], { name: "getAllVehicles" })
  findAll(
    @Args('pagination',{nullable:true})
    pagination?:PaginationInput
  ) {
    return this.vehicleService.findAll(pagination);
  }

  @Mutation(() => Vehicle, { name: "createVehicle" })
  create(@Args('vehicleInput') vehicle: CreateVehicleInput,) {
    return this.vehicleService.create(vehicle);
  }

  @Query(() => Vehicle, { name: "findVehicleById" })
  findOne(@Args("id") id: string) {
    return this.vehicleService.findOne(id)
  }

  @Mutation(() => Vehicle, { name: "updateVehiclle" })
  update(@Args('id') id: string, @Args('vehicle') vehicle: UpdateVehicleInput) {
    return this.vehicleService.update(id, vehicle)
  }

  @Mutation(() => Vehicle, { name: 'removeVehicle' })
  remove(@Args('id') id: string) {
    return this.vehicleService.remove(id);
  }
  @Query(() => [Vehicle], { name: "searchVehicle" })
  search(@Args('search', { type: () => SearchVehicleInput, nullable: true })
  search: SearchVehicleInput,
  ): Promise<Vehicle[]> {
    return this.vehicleService.search(search)
  }
}
