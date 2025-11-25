import { Field, InputType } from "@nestjs/graphql"
import { IsOptional, IsString } from "class-validator"

@InputType()
export class SearchVehicleInput{
    
        @Field({nullable:true})
        @IsString()
        @IsOptional()
        car_model?: string
    

}