import { Field, InputType, Int } from "@nestjs/graphql"
import { IsNumber,IsOptional } from "class-validator"

@InputType()
export class PaginationInput{

    @Field(()=>Int,{nullable:true})
    @IsNumber()
    @IsOptional()
    page?:number


    @Field(()=>Int,{nullable:true})
    @IsNumber()
    @IsOptional()
    limit?:number
}