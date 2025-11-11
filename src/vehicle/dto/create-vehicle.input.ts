import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { IsString, IsInt, IsOptional, IsNumber, IsDateString ,IsDate } from 'class-validator';
import { Type } from "class-transformer";

@InputType()
export class CreateVehicleInput {

@Field({nullable: true})
@IsString()
    first_name?: string

    @Field({nullable: true})
    @IsString()
    last_name: string

    @Field({nullable: true})
    @IsString()
    email: string

    @Field({nullable: true})
    @IsString()
    car_make: string

    @Field({nullable: true})
    @IsString()
    car_model: string

    @Field({nullable: true})
    @IsString()
    vin: string

    @Field({nullable: true})
    @IsDate()
    @Type(() => Date) 
    manufactured_date: Date
    
    @Field(()=>Int,{nullable:true})
    @IsNumber()
    age_of_the_vehicle:number

}