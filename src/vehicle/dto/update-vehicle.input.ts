import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateVehicleInput{



    @Field({nullable: true})
    first_name: string

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

}