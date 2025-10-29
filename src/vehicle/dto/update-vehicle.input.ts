import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateVehicleInput{



    @Field()
    first_name: string

    @Field()
    last_name: string

    @Field()
    email: string

    @Field()
    car_make: string

    @Field()
    car_model: string

    @Field()
    vin: string

    @Field()
    manufactured_date: Date

}