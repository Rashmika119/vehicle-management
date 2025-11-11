import { Field, InputType } from "@nestjs/graphql"
import { IsString } from "class-validator"

@InputType()
export class SearchVehicleInput{
    
        @Field({nullable:true})
        @IsString()
        car_model?: string
    

}