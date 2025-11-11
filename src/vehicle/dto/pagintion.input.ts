import { Field, InputType, Int } from "@nestjs/graphql"
import { IsNumber } from "class-validator"

@InputType()
export class PaginationInput{

    @Field(()=>Int,{defaultValue:1})
    @IsNumber()
    page:number


    @Field(()=>Int,{defaultValue:100})
    @IsNumber()
    limit:number
}