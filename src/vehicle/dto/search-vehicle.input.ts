import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class SearchVehicleInput{
    
        @Field({nullable:true})
        car_model?: string
    

}