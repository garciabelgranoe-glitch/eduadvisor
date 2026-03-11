import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ProductEventType } from "@prisma/client";

export class ListProductEventsDto {
  @IsOptional()
  @IsEnum(ProductEventType)
  type?: ProductEventType;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
