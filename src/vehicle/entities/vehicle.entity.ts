import { Directive, Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"


@ObjectType()
@Directive('@key(fields:"vin")')
@Entity()
export class Vehicle {
    @Field()
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Field()
    @Column()
    first_name: string

    @Field()
    @Column()
    last_name: string

    @Field()
    @Column()
    email: string

    @Field()
    @Column()
    car_make: string

    @Field()
    @Column()
    car_model: string

    @Field(() => ID)
    @Column({unique:true})
    vin: string

    @Field()
    @Column()
    manufactured_date: Date

    @Field(()=>Int) 
    @Column()
    age_of_the_vehicle:number

}