import { Type } from "class-transformer";
import { SchoolProfileStatus } from "@prisma/client";
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class ListSchoolsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  feeMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  feeMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingMin?: number;

  @IsOptional()
  @IsIn(["relevance", "name", "monthlyFeeEstimate", "createdAt", "leadIntentScore"])
  sortBy?: "relevance" | "name" | "monthlyFeeEstimate" | "createdAt" | "leadIntentScore" = "name";

  @IsOptional()
  @IsEnum(SchoolProfileStatus)
  profileStatus?: SchoolProfileStatus;
}
