import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsString ,IsOptional} from "class-validator";

@InputType()
export class UpdateVehicleInput{



    @Field({nullable: true})
    @IsOptional()
    @IsString()
    first_name: string

    @Field({nullable: true})
    @IsOptional()
    @IsString()
    last_name: string

    @Field({nullable: true})
    @IsOptional()
    @IsString()
    email: string

    @Field({nullable: true})
    @IsOptional()
    @IsString()
    car_make: string

    @Field({nullable: true})
    @IsOptional()
    @IsString()
    car_model: string

    @Field({nullable: true})
    @IsOptional()
    @IsString()
    vin: string

    @Field({nullable: true})
    @IsOptional()
    @IsDate()
    @Type(() => Date) 
    manufactured_date: Date

}