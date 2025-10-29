import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"


@InputType()
export class CreateVehicleInput {

@Field({nullable: true})
    first_name?: string

    @Field({nullable: true})
    last_name: string

    @Field({nullable: true})
    email: string

    @Field({nullable: true})
    car_make: string

    @Field({nullable: true})
    car_model: string

    @Field({nullable: true})
    vin: string

    @Field({nullable: true})
    manufactured_date: Date
    
    @Field(()=>Int,{nullable:true})
    age_of_the_vehicle:number

}